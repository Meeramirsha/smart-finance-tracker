package com.smartfinance.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    @Bean
    public DataSource dataSource() {
        String jdbcUrl = dbUrl;
        String parsedUser = username;
        String parsedPassword = password;

        // Parse postgres:// or postgresql:// URLs
        if (dbUrl != null && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
            try {
                String cleanUrl = dbUrl;
                if (dbUrl.startsWith("postgresql://")) {
                    cleanUrl = "postgres://" + dbUrl.substring("postgresql://".length());
                }
                URI uri = new URI(cleanUrl);
                String host = uri.getHost();
                int port = uri.getPort();
                if (port == -1) {
                    port = 5432;
                }
                String path = uri.getPath();
                
                jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    parsedUser = parts[0];
                    parsedPassword = parts[1];
                }
            } catch (Exception e) {
                // Fallback to simple replace if URI parsing fails
                if (dbUrl.startsWith("postgres://")) {
                    jdbcUrl = "jdbc:postgresql://" + dbUrl.substring("postgres://".length());
                } else if (dbUrl.startsWith("postgresql://")) {
                    jdbcUrl = "jdbc:postgresql://" + dbUrl.substring("postgresql://".length());
                }
            }
        }

        // Parse jdbc:postgresql://user:pass@host/db URLs if user pasted it that way
        if (jdbcUrl != null && jdbcUrl.startsWith("jdbc:postgresql://") && jdbcUrl.contains("@")) {
            try {
                String standardPart = jdbcUrl.substring("jdbc:postgresql://".length());
                String fakeUrl = "postgres://" + standardPart;
                URI uri = new URI(fakeUrl);
                String host = uri.getHost();
                int port = uri.getPort();
                if (port == -1) {
                    port = 5432;
                }
                String path = uri.getPath();
                jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;

                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    parsedUser = parts[0];
                    parsedPassword = parts[1];
                }
            } catch (Exception e) {
                // Ignore fallback
            }
        }

        return DataSourceBuilder.create()
                .url(jdbcUrl)
                .username(parsedUser)
                .password(parsedPassword)
                .driverClassName(driverClassName)
                .build();
    }
}
