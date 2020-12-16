import User from "../models/User";

export const findUser = async (email: string) => {
  return await User.findOne({ email });
};

export const updateUser = async (
  id: number,
  key: string,
  value: string | boolean | number
) => {
  await User.update({ _id: id }, { [key]: value });
};
