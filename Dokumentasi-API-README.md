### GET /api/finances/report

**Deskripsi:**
Menghasilkan laporan keuangan berdasarkan periode tertentu.

**Headers:**

- Authorization: Bearer {token}

**Query Parameters:**

- `startDate` (string, wajib): Tanggal mulai dalam format ISO (YYYY-MM-DD).
- `endDate` (string, wajib): Tanggal akhir dalam format ISO (YYYY-MM-DD).

**Response:**

- Status: 200 OK
- Body:
  json
  {
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "totalIncome": 5000,
  "totalExpense": 3000,
  "balance": 2000
  }

**Error:**

- 400 Bad Request: Format tanggal tidak valid atau tanggal mulai > tanggal akhir.
- 500 Internal Server Error: Terjadi kesalahan server.

---

### **Langkah Uji Coba**

1. **Endpoint Baru**

   - Pastikan endpoint dapat diakses dengan JWT valid.
   - Uji dengan berbagai kombinasi tanggal dan rentang waktu.

2. **Validasi Data**
   - Uji kasus dengan input tidak valid (misalnya: tanggal kosong, format tidak valid, dll.).
