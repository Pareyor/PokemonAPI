package com.pokepulse.service;

import com.pokepulse.dto.TrainerProfileDTO;
import com.pokepulse.entity.AppUser;
import com.pokepulse.entity.TrainerProfile;
import com.pokepulse.exception.ConflictException;
import com.pokepulse.exception.ResourceNotFoundException;
import com.pokepulse.repository.PokemonCardRepository;
import com.pokepulse.repository.TrainerProfileRepository;
import com.pokepulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Perfil TCG de cada usuario y monedero. Las monedas viven solo en {@link AppUser}; cualquier
 * operación que las modifique debe pasar por {@link #lockUser(Long)} para serializar gastos concurrentes.
 */
@Service
public class TrainerProfileService {

    public static final int DAILY_BONUS = 150;
    private static final Duration BONUS_COOLDOWN = Duration.ofHours(24);

    private final TrainerProfileRepository profileRepository;
    private final PokemonCardRepository cardRepository;
    private final UserRepository userRepository;
    private final StarterDeckService starterDeckService;
    private final boolean infiniteCoins;

    public TrainerProfileService(TrainerProfileRepository profileRepository, PokemonCardRepository cardRepository,
                                 UserRepository userRepository, StarterDeckService starterDeckService,
                                 @Value("${pokepulse.dev.infinite-coins:false}") boolean infiniteCoins) {
        this.infiniteCoins = infiniteCoins;
        this.profileRepository = profileRepository;
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
        this.starterDeckService = starterDeckService;
    }

    /** Alta de un entrenador nuevo: perfil vacío y mazo de bienvenida. Idempotente. */
    @Transactional
    public TrainerProfile createNewTrainer(AppUser user) {
        lockUser(user.getId());
        return profileRepository.findByUserId(user.getId()).orElseGet(() -> {
            TrainerProfile profile = profileRepository.save(new TrainerProfile(user.getId(), user.getTrainerName()));
            starterDeckService.grantTo(user.getId());
            return profile;
        });
    }

    @Transactional
    public TrainerProfile getOrCreateProfile(AppUser user) {
        return profileRepository.findByUserId(user.getId()).orElseGet(() -> createNewTrainer(user));
    }

    @Transactional
    public TrainerProfileDTO getProfileDTO(AppUser user) {
        TrainerProfile profile = getOrCreateProfile(user);
        AppUser fresh = userRepository.findById(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        LocalDateTime last = profile.getLastBonusClaimedAt();
        LocalDateTime bonusAvailableAt = last != null && last.plus(BONUS_COOLDOWN).isAfter(LocalDateTime.now())
            ? last.plus(BONUS_COOLDOWN) : null;
        return new TrainerProfileDTO(
            profile.getId(),
            fresh.getTrainerName(),
            fresh.getCoins(),
            profile.getPacksOpened(),
            profile.getBattlesWon(),
            profile.getBattlesLost(),
            cardRepository.countByOwnerId(user.getId()),
            cardRepository.countByOwnerIdAndIsInDeckTrue(user.getId()),
            bonusAvailableAt,
            infiniteCoins
        );
    }

    @Transactional
    public TrainerProfileDTO claimDailyBonus(AppUser user) {
        AppUser locked = lockUser(user.getId());
        TrainerProfile profile = getOrCreateProfile(user);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last = profile.getLastBonusClaimedAt();
        if (last != null && last.plus(BONUS_COOLDOWN).isAfter(now)) {
            Duration wait = Duration.between(now, last.plus(BONUS_COOLDOWN));
            throw new ConflictException(String.format("Ya reclamaste el bono diario. Vuelve en %dh %02dm.",
                wait.toHours(), wait.toMinutesPart()));
        }
        locked.setCoins(locked.getCoins() + DAILY_BONUS);
        profile.setLastBonusClaimedAt(now);
        return getProfileDTO(user);
    }

    /** Relee al usuario con bloqueo de fila; usar dentro de una transacción antes de tocar monedas. */
    @Transactional
    public AppUser lockUser(Long userId) {
        return userRepository.findByIdForUpdate(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));
    }

    /** Descuenta monedas de un usuario ya bloqueado con {@link #lockUser(Long)}. */
    public void spendCoins(AppUser lockedUser, int amount) {
        if (infiniteCoins) return; // modo pruebas: pokepulse.dev.infinite-coins
        if (lockedUser.getCoins() < amount) {
            throw new IllegalStateException("Monedas insuficientes. Necesitas " + amount + " monedas y tienes " + lockedUser.getCoins() + ".");
        }
        lockedUser.setCoins(lockedUser.getCoins() - amount);
    }
}
