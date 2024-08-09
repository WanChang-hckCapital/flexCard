import mongoose, { Schema } from "mongoose";
import { User } from "../../types";

const userSchema = new Schema<User>({
  // generatedId: {
  //   type: String,
  // },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  image: {
    type: String,
  },
  emailVerified: {
    type: String,
  },
});

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
