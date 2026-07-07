package com.smartfinance.controller;

import com.smartfinance.entity.Category;
import com.smartfinance.entity.User;
import com.smartfinance.payload.request.CategoryRequest;
import com.smartfinance.payload.response.MessageResponse;
import com.smartfinance.repository.CategoryRepository;
import com.smartfinance.repository.UserRepository;
import com.smartfinance.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Category>> getUserCategories(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<Category> categories = categoryRepository.findByUserId(userDetails.getId());
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryRequest request, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        Category category = Category.builder()
                .name(request.getName())
                .icon(request.getIcon())
                .color(request.getColor())
                .user(user)
                .build();

        categoryRepository.save(category);

        return ResponseEntity.ok(category);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Category category = categoryRepository.findById(id).orElse(null);

        if (category == null || !category.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Category not found or unauthorized"));
        }

        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());

        categoryRepository.save(category);

        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Category category = categoryRepository.findById(id).orElse(null);

        if (category == null || !category.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Category not found or unauthorized"));
        }

        categoryRepository.delete(category);

        return ResponseEntity.ok(new MessageResponse("Category deleted successfully!"));
    }
}
