import { Router } from 'express';
import { USER_ROLE } from '../../user/user.constant';
import { RuleController } from './rule.controller';
import auth from '../../../middleware/auth';
const router = Router();

//about us
router.post(
  '/create-about',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.createAbout,
);

router.get(
  '/about',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.getAbout,
);

//privacy policy
router.post(
  '/create-privacy-policy',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.createPrivacyPolicy,
);
//get privacy
router.get(
  '/privacy-policy',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.getPrivacyPolicy,
);

//terms and conditions
router.post(
  '/create-terms-and-conditions',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.createTermsAndCondition,
);
//get terms and conditions
router.get(
  '/terms-and-condition',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.getTermsAndCondition,
);
export const ruleRoutes = router;
