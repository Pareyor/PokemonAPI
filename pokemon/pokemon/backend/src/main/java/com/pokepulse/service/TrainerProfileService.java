package com.pokepulse.service;

import com.pokepulse.dto.TrainerProfileDTO;
import com.pokepulse.entity.TrainerProfile;
import com.pokepulse.repository.PokemonCardRepository;
import com.pokepulse.repository.TrainerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrainerProfileService {

    private final TrainerProfileRepository profileRepository;
    private final PokemonCardRepository cardRepository;

    public TrainerProfileService(TrainerProfileRepository profileRepository, PokemonCardRepository cardRepository) {
        this.profileRepository = profileRepository;
        this.cardRepository = cardRepository;
    }

    @Transactional
    public TrainerProfile getOrCreateProfile() {
        return profileRepository.findFirstByOrderByIdAsc()
            .orElseGet(() -> profileRepository.save(new TrainerProfile("Ash Ketchum")));
    }

    @Transactional(readOnly = true)
    public TrainerProfileDTO getProfileDTO() {
        TrainerProfile profile = getOrCreateProfile();
        long totalCards = cardRepository.count();
        long deckCards = cardRepository.countByIsInDeckTrue();
        return new TrainerProfileDTO(
            profile.getId(),
            profile.getName(),
            profile.getCoins(),
            profile.getPacksOpened(),
            profile.getBattlesWon(),
            profile.getBattlesLost(),
            totalCards,
            deckCards
        );
    }

    @Transactional
    public void addCoins(int amount) {
        TrainerProfile profile = getOrCreateProfile();
        profile.setCoins(profile.getCoins() + amount);
        profileRepository.save(profile);
    }
}
