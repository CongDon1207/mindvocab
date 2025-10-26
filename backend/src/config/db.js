import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
        console.log("Liên kết cơ sở dữ liệu thành công !!!");
    } catch(error) {
        console.error("Lỗi khi kết nối CSDL:", error);
        process.exit(1); // exit with errorF
    }
}