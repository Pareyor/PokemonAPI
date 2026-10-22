package com.pokepulse.exception;

/** La petición es válida pero choca con el estado actual del recurso (p. ej. abrir un sobre ya abierto). */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
