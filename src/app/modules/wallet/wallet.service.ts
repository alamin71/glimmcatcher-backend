import QueryBuilder from '../../builder/QueryBuilder';
import Wallet from './wallet.model';
import AppError from '../../error/AppError';

const insertTextToWallet = async (payload: any) => {
  console.log('🔥 Payload saving to DB:', JSON.stringify(payload, null, 2));
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
    .search([
      'text.title',
      'text.description',
      'voice.title',
      'imageVideo.title',
    ])
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

const deleteWalletData = async (id: string) => {
  const result = await Wallet.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(404, 'Wallet data not found');
  }

  return result;
};

const walletService = {
  insertTextToWallet,
  insertAudioToWallet,
  insertAiImageToWallet,
  insertVideosOrImagesToWallet,
  getMyWalletData,
  deleteWalletData,
};
export default walletService;
