import { UserService } from './user.service';
import { OcrServicesLogService } from './ocr-services-log.service';
import { OrganizationService } from './organization.service';
import { AuthService } from './auth.service';
import { ImageService } from './image.service';
import { RateModelService } from './rate-model.service';
import { OcrServicesRateModelService } from './ocr-services-img.service';
import { ENV_CONFIG } from '../config/environment';

// Factory pattern + Dependency Inversion Principle
// Services are created with their dependencies injected
class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  private createService<T>(serviceClass: new (...args: any[]) => T, baseUrl?: string): T {
    const key = serviceClass.name + (baseUrl || '');
    
    if (!this.services.has(key)) {
      // Create service instance using 'new' keyword
      const service = new serviceClass(baseUrl || ENV_CONFIG.API_BASE_URL);
      
      this.services.set(key, service);
    }
    
    return this.services.get(key);
  }

  getUserService(): UserService {
    return this.createService(UserService);
  }

  getOcrServicesLogService(): OcrServicesLogService {
    return this.createService(OcrServicesLogService);
  }

  getOrganizationService(): OrganizationService {
    return this.createService(OrganizationService);
  }

  getAuthService(): AuthService {
    return this.createService(AuthService);
  }

  getImageService(): ImageService {
    return this.createService(ImageService);
  }

  getRateModelService(): RateModelService {
    return this.createService(RateModelService);
  }
  getOcrServicesRateModelService(): OcrServicesRateModelService {
    return this.createService(OcrServicesRateModelService);
  }

  // Clear all cached services (useful for testing or when switching environments)
  clearServices(): void {
    this.services.clear();
  }
}

// Export singleton instance
export const serviceFactory = ServiceFactory.getInstance();

// Export individual services for convenience
export const userService = serviceFactory.getUserService();
export const ocrServicesLogService = serviceFactory.getOcrServicesLogService();
export const organizationService = serviceFactory.getOrganizationService();
export const authService = serviceFactory.getAuthService();
export const imageService = serviceFactory.getImageService();
export const rateModelService = serviceFactory.getRateModelService();
export const ocrServicesRateModelService = serviceFactory.getOcrServicesRateModelService();
