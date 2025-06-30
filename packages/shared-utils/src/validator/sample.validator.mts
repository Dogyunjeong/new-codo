import { ValidatorTypes } from '@base/shared-types';
import type { JSONSchemaType, ErrorObject } from 'ajv';
import Ajv from 'ajv';
// Using require for Ajv due to ESM/TypeScript compatibility
const validator = new Ajv();

// Schema for scene summaries
const sceneSummarySchema = {
  type: 'object',
  properties: {
    scene_number: { type: 'number' },
    title: { type: 'string' },
    key_description: { type: 'string' },
  },
  required: ['scene_number', 'title', 'key_description'],
};

// Schema for episode summaries
const episodeSummarySchema = {
  type: 'object',
  properties: {
    short_form_episode_number: { type: 'number' },
    title: { type: 'string' },
    key_description: { type: 'string' },
    scenes: {
      type: 'array',
      items: sceneSummarySchema,
      minItems: 1,
    },
  },
  required: ['short_form_episode_number', 'title', 'key_description', 'scenes'],
};

// Main schema for the entire short form episode structure
const shortFormEpisodeStructureSchema = {
  type: 'object',
  properties: {
    shortFormEpisodeStructure: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description_for_learner: { type: 'string' },
        main_characters: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
            },
          },
        },
        supporting_characters: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
            },
          },
        },
        synopsis: { type: 'string' },
        short_form_episode_summaries: {
          type: 'array',
          items: episodeSummarySchema,
          minItems: 1,
        },
      },
      required: [
        'title',
        'description_for_learner',
        'main_characters',
        'supporting_characters',
        'synopsis',
        'short_form_episode_summaries',
      ],
    },
  },
  required: ['shortFormEpisodeStructure'],
};

const validateShortFormEpisodeStructureSchema = validator.compile(shortFormEpisodeStructureSchema);

/**
 * Validates a short form episode structure
 * @param shortFormEpisodeStructure The structure to validate
 * @returns Validation result with isValid flag and any errors
 */
export const validateShortFormEpisodeStructure = (
  shortFormEpisodeStructure: any,
): ValidatorTypes.ValidatorResult => {
  const isValid = validateShortFormEpisodeStructureSchema(shortFormEpisodeStructure);

  return {
    isValid,
    errors:
      validateShortFormEpisodeStructureSchema.errors?.map((error: ErrorObject) => ({
        path: error.instancePath || 'root',
        message: error.message || 'Unknown validation error',
      })) ?? null,
  };
};
