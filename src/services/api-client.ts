import { Resource } from "@/app/components/types";
import { ResourcesClient } from "./clients/resources-client";

class ApiClient {
  public readonly resources: ResourcesClient;

  constructor() {
    this.resources = new ResourcesClient();
  }
}

export const apiClient = new ApiClient();

export type {
  ApiError,
  CreateResourceDto,
  UpdateResourceDto,
} from "./clients/resources-client";
export type { Resource };
