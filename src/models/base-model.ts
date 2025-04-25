/**
 * Base model class that all models extend
 */
export abstract class BaseModel {
    /**
     * Converts the model to a JSON representation
     */
    abstract toJSON(): any;
  }