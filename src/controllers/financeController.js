const Finance = require("../models/financeModel");

// Menampilkan semua data finance dengan filter
const getFinances = async (req, res) => {
  const { type, month, year } = req.query;
  const filters = { user: req.user.id };

  if (type) {
    filters.type = type;
  }

  if (month) {
    // Mengambil bulan dari query dan filter berdasarkan bulan
    const startDate = new Date(year, month - 1, 1); // Mengatur tanggal pertama bulan
    const endDate = new Date(year, month, 0); // Mengatur tanggal terakhir bulan
    filters.createdAt = { $gte: startDate, $lte: endDate };
  }

  if (year) {
    // Mengambil tahun dari query dan filter berdasarkan tahun
    const startDate = new Date(year, 0, 1); // Awal tahun
    const endDate = new Date(year, 11, 31); // Akhir tahun
    filters.createdAt = { $gte: startDate, $lte: endDate };
  }

  try {
    const finances = await Finance.find(filters);
    res.status(200).json(finances);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};


// Membuat data finance baru
const createFinance = async (req, res) => {
  const { title, amount, type } = req.body;

  if (!title || !amount || !type) {
    return res.status(400).json({ message: "Semua field harus diisi" });
  }

  try {
    const finance = await Finance.create({
      user: req.user.id,
      title,
      amount,
      type,
    });

    res.status(201).json(finance);
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat data finance" });
  }
};

// Mengupdate data finance
const updateFinance = async (req, res) => {
  const { id } = req.params;

  try {
    const finance = await Finance.findById(id);

    if (!finance || finance.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const updatedFinance = await Finance.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json(updatedFinance);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengupdate data finance" });
  }
};

// Menghapus data finance
const deleteFinance = async (req, res) => {
  const { id } = req.params;

  try {
    // Cari data finance berdasarkan ID
    const finance = await Finance.findById(id);

    if (!finance || finance.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // Hapus data finance
    await finance.deleteOne();
    res.status(200).json({ message: "Data berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus data finance" });
  }
};

// Laporan keuangan
const getFinanceReport = async (req, res) => {
  try {
    const finances = await Finance.find({ user: req.user.id });

    const totalIncomes = finances
      .filter((finance) => finance.type === "income")
      .reduce((sum, finance) => sum + finance.amount, 0);

    const totalExpenses = finances
      .filter((finance) => finance.type === "expense")
      .reduce((sum, finance) => sum + finance.amount, 0);

    const balance = totalIncomes - totalExpenses;

    res.status(200).json({ totalIncomes, totalExpenses, balance });
  } catch (error) {
    res.status(500).json({ message: "Gagal mendapatkan laporan keuangan" });
  }
};

module.exports = {
  getFinances,
  createFinance,
  updateFinance,
  deleteFinance,
  getFinanceReport,
};
