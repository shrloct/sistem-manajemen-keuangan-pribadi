const Finance = require("../models/financeModel");

// Fungsi untuk mendapatkan statistik berdasarkan kategori
const getCategoryStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const finances = await Finance.find({ user: userId });

    const categoryStats = finances.reduce((acc, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = { total: 0, count: 0 };
      }
      acc[curr.category].total += curr.amount;
      acc[curr.category].count += 1;
      return acc;
    }, {});

    res.status(200).json(categoryStats);
  } catch (error) {
    res.status(500).json({ message: "Gagal mendapatkan statistik kategori" });
  }
};

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
  const { title, amount, type, category } = req.body;

  // Validasi input
  if (!title || !amount || !type || !category) {
    return res.status(400).json({ message: "Semua field harus diisi" });
  }

  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ message: "Tipe harus income atau expense" });
  }

  if (
    ![
      "salary",
      "education",
      "health",
      "food",
      "transportation",
      "entertainment",
      "utilities",
      "others",
    ].includes(category)
  ) {
    return res.status(400).json({
      message:
        "Kategori harus salary, education, health, food, transportation, entertainment, utilities, others",
    });
  }

  try {
    const finance = await Finance.create({
      user: req.user.id,
      title,
      amount,
      type,
      category,
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

// Fungsi untuk mendapatkan statistik bulanan
const getMonthlyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;

    if (!year) {
      return res
        .status(400)
        .json({ message: "Tahun harus disertakan dalam query parameter." });
    }

    // Filter data berdasarkan tahun
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);

    const finances = await Finance.find({
      user: userId,
      createdAt: { $gte: startOfYear, $lt: endOfYear },
    });

    // Hitung statistik bulanan
    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    }));

    finances.forEach((item) => {
      const monthIndex = item.createdAt.getUTCMonth(); // bulan (0-11)
      if (item.type === "income") {
        monthlyStats[monthIndex].totalIncome += item.amount;
      } else if (item.type === "expense") {
        monthlyStats[monthIndex].totalExpense += item.amount;
      }
      monthlyStats[monthIndex].balance =
        monthlyStats[monthIndex].totalIncome -
        monthlyStats[monthIndex].totalExpense;
    });

    res.status(200).json(monthlyStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterFinance = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      type,
      month,
      year,
      keyword,
      category,
      minAmount,
      maxAmount,
      startDate,
      endDate,
    } = req.query;

    let query = { user: userId };

    // Filter berdasarkan jenis transaksi (income atau expense)
    if (type) {
      query.type = type;
    }

    // Filter berdasarkan tahun
    if (year) {
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
      query.createdAt = { $gte: startOfYear, $lt: endOfYear };
    }

    // Filter berdasarkan bulan (jika bulan juga diberikan)
    if (month) {
      if (!query.createdAt) {
        query.createdAt = {};
      }
      const yearValue = year || new Date().getFullYear();
      const monthStart = new Date(
        `${yearValue}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`
      );
      const nextMonth = Number(month) + 1;
      const monthEnd =
        nextMonth > 12
          ? new Date(`${Number(yearValue) + 1}-01-01T00:00:00.000Z`)
          : new Date(
              `${yearValue}-${String(nextMonth).padStart(
                2,
                "0"
              )}-01T00:00:00.000Z`
            );
      query.createdAt.$gte = monthStart;
      query.createdAt.$lt = monthEnd;
    }

    // Filter berdasarkan jumlah uang (minAmount dan maxAmount)
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    // Pencarian berdasarkan kata kunci di title atau category
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
      ];
    }

    // Filter berdasarkan kategori
    if (category) {
      query.category = category;
    }

    // Filter berdasarkan rentang tanggal
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Ambil data berdasarkan query yang telah dibuat / eksekusi query
    const finances = await Finance.find(query).sort({ createdAt: -1 });

    res.status(200).json(finances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller untuk mendapatkan laporan keuangan berdasarkan periode tertentu
const getFinanceReportByPeriod = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Tanggal mulai dan akhir harus diisi" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Format tanggal tidak valid" });
    }

    if (start > end) {
      return res
        .status(400)
        .json({ message: "Tanggal mulai harus sebelum tanggal akhir" });
    }

    // Query untuk mengambil data keuangan dalam periode
    const finances = await Finance.find({
      user: userId,
      createdAt: { $gte: start, $lte: end },
    });

    // Hitung total pemasukan, pengeluaran, dan saldo
    const totalIncome = finances
      .filter((item) => item.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = finances
      .filter((item) => item.type === "expense")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = totalIncome - totalExpense;

    res.status(200).json({
      startDate,
      endDate,
      totalIncome,
      totalExpense,
      balance,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

module.exports = {
  getFinanceReportByPeriod,
};

module.exports = {
  getCategoryStats,
  getFinances,
  createFinance,
  updateFinance,
  deleteFinance,
  getFinanceReport,
  getMonthlyStats,
  filterFinance,
  getFinanceReportByPeriod,
};
