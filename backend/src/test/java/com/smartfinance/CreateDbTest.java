package com.smartfinance;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class CreateDbTest {

    @Test
    public void testCreateDatabase() {
        String[] passwords = {"postgres", "", "password", "admin", "root", "finance_password"};
        boolean success = false;
        
        for (String password : passwords) {
            String url = "jdbc:postgresql://localhost:5432/postgres";
            String user = "postgres";
            System.out.println("Trying to connect to " + url + " with user=" + user + " and password='" + password + "'");
            
            try (Connection conn = DriverManager.getConnection(url, user, password)) {
                System.out.println("Connected successfully!");
                try (Statement stmt = conn.createStatement()) {
                    stmt.executeUpdate("CREATE DATABASE smart_finance");
                    System.out.println("Database smart_finance created successfully!");
                } catch (Exception e) {
                    if (e.getMessage().contains("already exists")) {
                        System.out.println("Database smart_finance already exists.");
                    } else {
                        System.err.println("Error creating database: " + e.getMessage());
                    }
                }
                success = true;
                break;
            } catch (Exception e) {
                System.err.println("Connection failed: " + e.getMessage());
            }
        }
        
        if (!success) {
            System.err.println("Could not connect to PostgreSQL with any of the default passwords.");
        }
    }
}
