import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI não está definida no ambiente.");
}

const dbConnect = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    await mongoose.connect(MONGO_URI);
    console.log("Conectado ao MongoDB com sucesso!");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    throw new Error("Falha na conexão com o banco de dados.");
  }
};

export default dbConnect;