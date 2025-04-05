import express from 'express';
import { CategoryService } from '../services/category.service';
import { ApiResponse } from '../models';
import config from '../config';

export function createCategoriesRouter(categoryService: CategoryService) {
  const router = express.Router();

  // Helper to add delay if needed
  const withLatency = <T>(fn: (req: express.Request, res: express.Response) => Promise<void>) => {
    return async (req: express.Request, res: express.Response) => {
      if (config.simulateLatency) {
        setTimeout(() => fn(req, res), config.latencyMs);
      } else {
        await fn(req, res);
      }
    };
  };

  // Helper to create API responses
  const sendResponse = <T>(res: express.Response, data: T | null, error: string | null = null, status = 200) => {
    const response: ApiResponse<T> = {
      data,
      error,
      status
    };
    
    res.status(status).json(response);
  };

  // Get all categories
  router.get('/', withLatency(async (req, res) => {
    try {
      const categories = await categoryService.getAllCategories();
      sendResponse(res, categories);
    } catch (error) {
      console.error('Error getting categories:', error);
      sendResponse(res, null, 'Failed to fetch categories', 500);
    }
  }));

  // Get category by ID
  router.get('/:id', withLatency(async (req, res) => {
    try {
      const category = await categoryService.getCategory(req.params.id);
      
      if (category) {
        sendResponse(res, category);
      } else {
        sendResponse(res, null, 'Category not found', 404);
      }
    } catch (error) {
      console.error('Error getting category:', error);
      sendResponse(res, null, 'Failed to fetch category', 500);
    }
  }));

  // Create category
  router.post('/', withLatency(async (req, res) => {
    try {
      const newCategory = await categoryService.createCategory(req.body);
      sendResponse(res, newCategory, null, 201);
    } catch (error) {
      console.error('Error creating category:', error);
      sendResponse(res, null, 'Failed to create category', 500);
    }
  }));

  // Update category
  router.put('/:id', withLatency(async (req, res) => {
    try {
      const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
      
      if (updatedCategory) {
        sendResponse(res, updatedCategory);
      } else {
        sendResponse(res, null, 'Category not found', 404);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      sendResponse(res, null, 'Failed to update category', 500);
    }
  }));

  // Delete category
  router.delete('/:id', withLatency(async (req, res) => {
    try {
      const result = await categoryService.deleteCategory(req.params.id);
      
      if (result) {
        sendResponse(res, { id: req.params.id });
      } else {
        sendResponse(res, null, 'Category not found', 404);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      sendResponse(res, null, 'Failed to delete category', 500);
    }
  }));

  return router;
}
