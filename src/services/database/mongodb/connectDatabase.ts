import { connect } from 'mongoose';
import config from "config";

const connectDB = async () => {
  try {
    const mongoURI: string = config.get('mongoURI');
    await connect(mongoURI);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export default connectDB;