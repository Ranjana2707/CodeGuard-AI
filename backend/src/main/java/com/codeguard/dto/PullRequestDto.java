package com.codeguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PullRequestDto {
    private Integer number;
    private String title;
    private String state;
    private String author;
    private int changedFiles;
    private String branch;
    private String createdAt;
}
