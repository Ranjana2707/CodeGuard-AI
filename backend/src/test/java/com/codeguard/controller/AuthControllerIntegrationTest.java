package com.codeguard.controller;

import com.codeguard.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private static String accessToken;

    @Test
    @Order(1)
    void register_ValidRequest_Returns200() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("integrationuser");
        request.setEmail("integration@example.com");
        request.setPassword("Password123!");
        request.setFullName("Integration User");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
            .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        accessToken = objectMapper.readTree(responseBody)
            .path("data").path("accessToken").asText();
    }

    @Test
    @Order(2)
    void register_DuplicateUsername_Returns400() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("integrationuser");
        request.setEmail("other@example.com");
        request.setPassword("Password123!");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(3)
    void login_ValidCredentials_Returns200() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("integrationuser");
        request.setPassword("Password123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.data.tokenType").value("Bearer"));
    }

    @Test
    @Order(4)
    void login_WrongPassword_Returns401() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("integrationuser");
        request.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(5)
    void register_InvalidEmail_Returns400() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("anotheruser");
        request.setEmail("not-an-email");
        request.setPassword("Password123!");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }
}
