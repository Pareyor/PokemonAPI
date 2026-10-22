package com.pokepulse.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Inyecta el {@link com.pokepulse.entity.AppUser} de la sesión (cabecera {@code Authorization: Bearer <token>})
 * en un parámetro de controlador. Si no hay sesión válida responde 401.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {}
