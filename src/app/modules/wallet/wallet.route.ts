import { Router } from 'express';

import auth from '../../middleware/auth';
import upload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import { USER_ROLE } from '../user/user.constant';
import walletController from './wallet.controller';
const router = Router();
router.get('/', auth(USER_ROLE.user), walletController.getMyWalletData);
router.post(
  '/create-notes',
  auth(USER_ROLE.user),
  walletController.insertTextToWallet,
);
router.post(
  '/create-voices',
  auth(USER_ROLE.user),
  upload.single('file'),
  parseData(),
  walletController.insertAudioToWallet,
);
router.post(
  '/create-ai-images',
  auth(USER_ROLE.user),
  walletController.insertAiImageToWallet,
);

router.post(
  '/insert-videos-or-images',
  auth(USER_ROLE.user),
  walletController.insertVideosOrImagesToWallet,
);
router.delete('/:id', auth(USER_ROLE.user), walletController.deleteWalletData);

const walletRoutes = router;

export default walletRoutes;
