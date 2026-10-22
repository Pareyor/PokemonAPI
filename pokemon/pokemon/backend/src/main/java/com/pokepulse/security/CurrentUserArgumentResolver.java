package com.pokepulse.security;

import com.pokepulse.entity.AppUser;
import com.pokepulse.exception.UnauthorizedException;
import com.pokepulse.service.AuthService;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    private final AuthService authService;

    public CurrentUserArgumentResolver(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class) && AppUser.class.equals(parameter.getParameterType());
    }

    @Override
    public AppUser resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                   NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        AppUser user = authService.resolveUser(webRequest.getHeader(HttpHeaders.AUTHORIZATION));
        if (user == null) {
            throw new UnauthorizedException("Inicia sesión para acceder a tu colección.");
        }
        return user;
    }
}
