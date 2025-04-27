import QueryBuilder from '../../builder/QueryBuilder';
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

const getMyWalletData = async (query: Record<string, any>) => {
  const walletModel = new QueryBuilder(Wallet.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();
  const data = await walletModel.modelQuery;
  const meta = await walletModel.countTotal();
  return {
    data,
    meta,
  };
};

const walletService = {
  insertTextToWallet,
  insertAudioToWallet,
  insertAiImageToWallet,
  insertVideosOrImagesToWallet,
  getMyWalletData,
};
export default walletService;
