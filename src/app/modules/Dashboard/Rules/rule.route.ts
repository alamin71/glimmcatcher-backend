import { Router } from 'express';
import { USER_ROLE } from '../../user/user.constant';
import { RuleController } from './rule.controller';
import auth from '../../../middleware/auth';
const router = Router();

//about us
router.post(
  '/about',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.createAbout,
);

router.get(
  '/get-about',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.getAbout,
);

//privacy policy
router.post(
  '/privacy-policy',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.createPrivacyPolicy,
);
//get privacy
router.get(
  '/get-privacy-policy',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.getPrivacyPolicy,
);

//terms and conditions
router.post(
  '/terms-and-conditions',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.createTermsAndCondition,
);
//get terms and conditions
router.get(
  '/get-terms-and-condition',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.getTermsAndCondition,
);
export const ruleRoutes = router;
