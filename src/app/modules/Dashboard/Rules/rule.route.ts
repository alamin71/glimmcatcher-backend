import express from 'express';
import { USER_ROLE } from '../../user/user.constant';
import { RuleController } from './rule.controller';
import auth from '../../../middleware/auth';
const router = express.Router();

//about us
router
  .route('/about')
  .post(auth(USER_ROLE.admin, USER_ROLE.sup_admin), RuleController.createAbout)
  .get(RuleController.getAbout);

//privacy policy
router
  .route('/privacy-policy')
  .post(
    auth(USER_ROLE.admin, USER_ROLE.sup_admin),
    RuleController.createPrivacyPolicy,
  )
  .get(RuleController.getPrivacyPolicy);

//terms and conditions
router
  .route('/terms-and-conditions')
  .post(
    auth(USER_ROLE.admin, USER_ROLE.sup_admin),
    RuleController.createTermsAndCondition,
  )
  .get(RuleController.getTermsAndCondition);
