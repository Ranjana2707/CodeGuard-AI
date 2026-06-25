package com.codeguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GithubRepoDto {
    private Long id;
    private String name;
    private String fullName;
    private String language;
    private String defaultBranch;
    private boolean connected;
}
