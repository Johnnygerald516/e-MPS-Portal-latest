import api from './axios';
import { authEndpoints } from './endpoints/auth';
import { profileEndpoints } from './endpoints/profile';
import { locationEndpoints } from './endpoints/location';
import { verificationEndpoints } from './endpoints/verification';
import { personalInfoEndpoints } from './endpoints/personal-info';
import { residenceInfoEndpoints } from './endpoints/residence-info';
import { parentsInfoEndpoints } from './endpoints/parents-info';
import { documentsEndpoints } from './endpoints/documents';

// Export all endpoints and the base API instance
export {
  api,
  authEndpoints,
  profileEndpoints,
  locationEndpoints,
  verificationEndpoints,
  personalInfoEndpoints,
  residenceInfoEndpoints,
  parentsInfoEndpoints,
  documentsEndpoints
};
