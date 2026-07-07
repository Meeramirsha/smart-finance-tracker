package com.smartfinance.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    public String generateInsight(String financialDataPrompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return generateMockInsight(financialDataPrompt);
        }

        try {
            HttpClient client = HttpClient.newHttpClient();
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

            String escapedPrompt = escapeJsonString(financialDataPrompt);

            String requestBody = "{\n" +
                    "  \"contents\": [{\n" +
                    "    \"parts\": [{\n" +
                    "      \"text\": \"" + escapedPrompt + "\"\n" +
                    "    }]\n" +
                    "  }],\n" +
                    "  \"generationConfig\": {\n" +
                    "    \"responseMimeType\": \"application/json\"\n" +
                    "  }\n" +
                    "}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                // Parse the response to extract the text
                return extractTextFromGeminiResponse(response.body());
            } else {
                System.err.println("Gemini API error. Status: " + response.statusCode() + ", Body: " + response.body());
                return generateMockInsight(financialDataPrompt);
            }
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            return generateMockInsight(financialDataPrompt);
        }
    }

    private String extractTextFromGeminiResponse(String responseBody) {
        try {
            // A simple JSON parser to extract candidates[0].content.parts[0].text without external deps
            int candidatesIndex = responseBody.indexOf("\"candidates\"");
            if (candidatesIndex == -1) return responseBody;

            int textIndex = responseBody.indexOf("\"text\":", candidatesIndex);
            if (textIndex == -1) return responseBody;

            int startQuote = responseBody.indexOf("\"", textIndex + 7);
            int endQuote = responseBody.indexOf("\"", startQuote + 1);

            // Handle escaped double quotes inside the text
            while (responseBody.charAt(endQuote - 1) == '\\') {
                endQuote = responseBody.indexOf("\"", endQuote + 1);
            }

            String text = responseBody.substring(startQuote + 1, endQuote);
            // Unescape common JSON characters
            return text.replace("\\n", "\n")
                    .replace("\\\"", "\"")
                    .replace("\\\\", "\\")
                    .replace("\\t", "\t");
        } catch (Exception e) {
            System.err.println("Error parsing Gemini response: " + e.getMessage());
            return responseBody;
        }
    }

    private String escapeJsonString(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private String generateMockInsight(String prompt) {
        // Return a realistic mock response matching the JSON schema
        return "{\n" +
                "  \"mood\": \"warning\",\n" +
                "  \"moneyStory\": \"This month, your savings rate is low due to higher miscellaneous expenses. You had multiple dining and subscription charges early in the month. Try to plan your food budget to increase savings.\",\n" +
                "  \"leaks\": [\n" +
                "    \"Food Delivery ($45 total across 4 transactions)\",\n" +
                "    \"Unused Streaming Subscription ($15)\"\n" +
                "  ],\n" +
                "  \"savingsChallenge\": \"Try the 'No-Order Weekend' challenge. Commit to cooking all meals this Saturday and Sunday to save an average of $30!\",\n" +
                "  \"recommendations\": [\n" +
                "    \"Set a budget limit of $50 on dining out next month.\",\n" +
                "    \"Review your recurring subscriptions to see what can be paused.\"\n" +
                "  ]\n" +
                "}";
    }
}
