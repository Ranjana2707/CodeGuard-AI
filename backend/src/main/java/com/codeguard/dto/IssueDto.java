package com.codeguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueDto {
    private Long id;
    private String title;
    private String severity;
    private String issueType;
    private Integer lineNumber;
    private String description;
    private String fixSuggestion;
    private String cweId;
}
