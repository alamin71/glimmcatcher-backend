import Wallet from './wallet.model';

const insertTextToWallet = async (payload: any) => {
  const result = await Wallet.create(payload);
  return result;
};
const insertAudioToWallet = async (payload: any) => {
  const result = await Wallet.create(payload);
  return result;
};
const insertAiImageToWallet = async (payload: any) => {
  const result = await Wallet.create(payload);
  return result;
};
const insertVideosOrImagesToWallet = async (payload: any) => {
  const result = await Wallet.create(payload);
  return result;
};

const walletService = {
  insertTextToWallet,
  insertAudioToWallet,
  insertAiImageToWallet,
  insertVideosOrImagesToWallet,
};
export default walletService;
