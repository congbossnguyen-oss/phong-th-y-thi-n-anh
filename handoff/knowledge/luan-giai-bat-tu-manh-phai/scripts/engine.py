#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
engine.py — Bộ tính toán khách quan cho skill luan-giai-bat-tu-manh-phai.

PHẠM VI (đúng theo lựa chọn "Hướng C" của Công):
  Script này CHỈ làm phần tính toán thuần túy, không nhập nhằng phán đoán:
    - Thập Thần của từng Can lộ + Can tàng so với Nhật Chủ
    - Trạng thái vòng Trường Sinh của từng Chi so với Nhật Chủ
    - Liệt kê TOÀN BỘ quan hệ Hợp/Xung/Hình/Hại/Phá/Tam Hợp/Tam Hội có thể có
      giữa các Chi, và Thiên Can Ngũ Hợp giữa các Can, kèm hiệu suất tố công
      tra theo bảng đã có trong references/cau-truc-to-cong.md
    - Xác định Mộ Khố (Thìn/Tuất/Sửu/Mùi) đang là mộ khố của hành nào,
      và hành đó tương ứng Thập Thần gì so với Nhật Chủ
    - Tally Thể/Dụng theo "trong nhà" (Ngày+Giờ) và "ngoài nhà" (Năm+Tháng)
    - Liệt kê ứng viên "xuất xứ" cho từng Thiên Can (Can nào có thể "đi ra"
      từ Chi nào, theo Chi tàng hoặc theo vòng Trường Sinh)

  Script KHÔNG tự kết luận: Tố Công nào là chính, cấu trúc nào "có tạo công",
  Chính Cục hay Phản Cục, nghề nghiệp cụ thể... — các phần đó đòi hỏi phán
  đoán theo ngữ cảnh (xem cảnh báo trong cau-truc-to-cong.md mục 5: cùng 1
  cấu trúc có thể cho kết quả trái ngược tùy vai trò cụ thể). Claude đọc
  JSON do script xuất ra, rồi luận tiếp theo các bước 3–10 trong SKILL.md.

CÁCH DÙNG:
    python3 engine.py --nam "Mậu Thìn" --thang "Nhâm Tuất" --ngay "Đinh Sửu" --gio "Đinh Mùi"
    (tùy chọn thêm --dai-van "Kỷ Tị" --luu-nien "Mậu Dần" để đưa Tuế Vận vào phân tích quan hệ)

    Hoặc import làm module:
        from engine import phan_tich_la_so
        report = phan_tich_la_so("Mậu Thìn", "Nhâm Tuất", "Đinh Sửu", "Đinh Mùi")
"""

import argparse
import json
import sys

# ----------------------------------------------------------------------
# 1. DỮ LIỆU NỀN
# ----------------------------------------------------------------------

CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"]
CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]

# Ngũ hành + Âm Dương của Thiên Can (index khớp CAN)
CAN_HANH = ["Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ", "Kim", "Kim", "Thủy", "Thủy"]
CAN_AM_DUONG = ["Dương", "Âm"] * 5  # Giáp Dương, Ất Âm, Bính Dương, ...

# Ngũ hành + Âm Dương của Địa Chi (chính khí)
CHI_HANH = ["Thủy", "Thổ", "Mộc", "Mộc", "Thổ", "Hỏa", "Hỏa", "Thổ", "Kim", "Kim", "Thổ", "Thủy"]
CHI_AM_DUONG = ["Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm", "Dương", "Âm"]

# Địa Chi tàng Can — theo thứ tự [chính khí, trung khí, dư khí] (dùng lap-tu-tru.md)
CHI_TANG_CAN = {
    "Tý": ["Quý"],
    "Sửu": ["Kỷ", "Quý", "Tân"],
    "Dần": ["Giáp", "Bính", "Mậu"],
    "Mão": ["Ất"],
    "Thìn": ["Mậu", "Ất", "Quý"],
    "Tị": ["Bính", "Canh", "Mậu"],
    "Ngọ": ["Đinh", "Kỷ"],
    "Mùi": ["Kỷ", "Đinh", "Ất"],
    "Thân": ["Canh", "Nhâm", "Mậu"],
    "Dậu": ["Tân"],
    "Tuất": ["Mậu", "Tân", "Đinh"],
    "Hợi": ["Nhâm", "Giáp"],
}

# Ngũ hành sinh / khắc
SINH = {"Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc"}
KHAC = {"Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc"}

# Mộ Khố: hành nào có Mộ Khố tại Chi nào (Hỏa và Thổ dùng chung Tuất — quy ước
# đã thống nhất trong references/mo-kho.md của skill luan-giai-bat-tu)
MO_KHO = {"Mộc": "Mùi", "Hỏa": "Tuất", "Thổ": "Tuất", "Kim": "Sửu", "Thủy": "Thìn"}

# Vị trí bắt đầu vòng Trường Sinh của mỗi Can (index vào CHI)
TRUONG_SINH_START = {
    "Giáp": "Hợi", "Ất": "Ngọ", "Bính": "Dần", "Đinh": "Dậu", "Mậu": "Dần",
    "Kỷ": "Dậu", "Canh": "Tị", "Tân": "Tý", "Nhâm": "Thân", "Quý": "Mão",
}
TRUONG_SINH_STAGES = [
    "Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy",
    "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng",
]

# ----------------------------------------------------------------------
# 2. QUAN HỆ ĐỊA CHI / THIÊN CAN
# ----------------------------------------------------------------------

LUC_HOP_CHI = {
    frozenset(["Tý", "Sửu"]): "Thổ",
    frozenset(["Dần", "Hợi"]): "Mộc",
    frozenset(["Mão", "Tuất"]): "Hỏa",
    frozenset(["Thìn", "Dậu"]): "Kim",
    frozenset(["Tị", "Thân"]): "Thủy",
    frozenset(["Ngọ", "Mùi"]): "Thổ",
}

LUC_XUNG_CHI = [
    frozenset(["Tý", "Ngọ"]), frozenset(["Sửu", "Mùi"]), frozenset(["Dần", "Thân"]),
    frozenset(["Mão", "Dậu"]), frozenset(["Thìn", "Tuất"]), frozenset(["Tị", "Hợi"]),
]

LUC_HAI_CHI = [
    frozenset(["Tý", "Mùi"]), frozenset(["Sửu", "Ngọ"]), frozenset(["Dần", "Tị"]),
    frozenset(["Mão", "Thìn"]), frozenset(["Thân", "Hợi"]), frozenset(["Dậu", "Tuất"]),
]

LUC_PHA_CHI = [
    frozenset(["Tý", "Dậu"]), frozenset(["Ngọ", "Mão"]), frozenset(["Thân", "Tị"]),
    frozenset(["Dần", "Hợi"]), frozenset(["Thìn", "Sửu"]), frozenset(["Tuất", "Mùi"]),
]

TAM_HINH_NHOM = [
    frozenset(["Dần", "Tị", "Thân"]),   # tam hình vô ân
    frozenset(["Sửu", "Mùi", "Tuất"]),  # tam hình trì thế
]
TU_HINH_CHI = {"Thìn", "Ngọ", "Dậu", "Hợi"}       # tự hình khi xuất hiện ≥2 lần
TUONG_HINH_DOI = [frozenset(["Tý", "Mão"])]        # vô lễ chi hình

TAM_HOP_CUC = {
    "Thủy": ["Thân", "Tý", "Thìn"],
    "Mộc": ["Hợi", "Mão", "Mùi"],
    "Hỏa": ["Dần", "Ngọ", "Tuất"],
    "Kim": ["Tị", "Dậu", "Sửu"],
}

TAM_HOI_CUC = {
    "Mộc": ["Dần", "Mão", "Thìn"],
    "Hỏa": ["Tị", "Ngọ", "Mùi"],
    "Kim": ["Thân", "Dậu", "Tuất"],
    "Thủy": ["Hợi", "Tý", "Sửu"],
}

# Ám hợp Địa Chi thường gặp (không đầy đủ tuyệt đối — xem quan-he-can-chi.md)
AM_HOP_CHI = [
    frozenset(["Dần", "Sửu"]), frozenset(["Hợi", "Ngọ"]), frozenset(["Mão", "Thân"]),
    frozenset(["Tị", "Dậu"]), frozenset(["Tý", "Tị"]),
]

THIEN_CAN_NGU_HOP = {
    frozenset(["Giáp", "Kỷ"]): "Thổ (hoặc Mộc)",
    frozenset(["Ất", "Canh"]): "Kim (hoặc Mộc)",
    frozenset(["Bính", "Tân"]): "Thủy (hoặc Kim)",
    frozenset(["Đinh", "Nhâm"]): "Mộc (hoặc Thủy)",
    frozenset(["Mậu", "Quý"]): "Hỏa (hoặc Thổ)",
}

# Hiệu suất Tố Công — tra theo bảng cau-truc-to-cong.md mục 9
HIEU_SUAT_HOP = {
    frozenset(["Tị", "Thân"]): "Cao nhất",
    frozenset(["Tị", "Dậu"]): "Cao nhất",
    frozenset(["Mão", "Tuất"]): "Khá cao",
    frozenset(["Hợi", "Ngọ"]): "Khá cao (ám hợp)",
    frozenset(["Mão", "Thân"]): "Khá cao (ám hợp)",
    frozenset(["Tý", "Sửu"]): "Trung bình",
    frozenset(["Dần", "Sửu"]): "Trung bình (ám hợp)",
    frozenset(["Dần", "Hợi"]): "Thấp",
    frozenset(["Thìn", "Dậu"]): "Thấp",
    frozenset(["Ngọ", "Mùi"]): "Thấp",
    frozenset(["Mão", "Mùi"]): "Thấp",
    frozenset(["Hợi", "Mùi"]): "Thấp",
}

HIEU_SUAT_XUNG_HINH_HAI = {
    frozenset(["Sửu", "Mùi"]): "Cao nhất (xung)",
    frozenset(["Thìn", "Tuất"]): "Cao nhất (xung)",
    frozenset(["Sửu", "Tuất"]): "Cao nhất (hình)",
    frozenset(["Dần", "Thân"]): "Khá cao (xung)",
    frozenset(["Tị", "Hợi"]): "Khá cao (xung)",
    frozenset(["Tý", "Ngọ"]): "Khá cao (xung)",
    frozenset(["Mão", "Dậu"]): "Khá cao (xung)",
    frozenset(["Sửu", "Ngọ"]): "Cao (hại)",
    frozenset(["Tý", "Mùi"]): "Cao (hại)",
    frozenset(["Dậu", "Tuất"]): "Thấp (hại)",
    frozenset(["Mão", "Thìn"]): "Thấp (hại)",
    frozenset(["Dần", "Tị"]): "Không có hiệu suất (hại)",
    frozenset(["Thân", "Hợi"]): "Không có hiệu suất (hại)",
}

TRU_NAMES = ["Năm", "Tháng", "Ngày", "Giờ"]
TRONG_NHA = {"Ngày", "Giờ"}
NGOAI_NHA = {"Năm", "Tháng"}


# ----------------------------------------------------------------------
# 3. HÀM TIỆN ÍCH
# ----------------------------------------------------------------------

def _split_can_chi(tru_str):
    """'Mậu Thìn' -> ('Mậu', 'Thìn'). Chấp nhận cách nhau bởi khoảng trắng."""
    parts = tru_str.strip().split()
    if len(parts) != 2:
        raise ValueError(f"Không nhận diện được Can Chi từ: '{tru_str}' — cần dạng 'Can Chi', ví dụ 'Mậu Thìn'.")
    can, chi = parts
    if can not in CAN:
        raise ValueError(f"Thiên Can không hợp lệ: '{can}'")
    if chi not in CHI:
        raise ValueError(f"Địa Chi không hợp lệ: '{chi}'")
    return can, chi


def thap_than(nhat_can, can_khac):
    """Xác định Thập Thần của can_khac so với Nhật Can (nhat_can).
    LƯU Ý: hàm này luôn tính bình thường kể cả khi can_khac trùng CHỮ với nhat_can
    (ví dụ Giờ Can cũng là 'Đinh' khi Nhật Can là 'Đinh') — trường hợp đó vẫn ra
    'Tỷ Kiên' theo đúng quy ước (cùng hành, cùng Âm Dương). Chỉ riêng VỊ TRÍ Trụ
    Ngày (chính là Nhật Chủ) mới không có Thập Thần — việc đó do phan_tich_la_so()
    xử lý riêng bằng vị trí trụ, không xử lý ở đây bằng cách so sánh chuỗi."""
    hanh_ta = CAN_HANH[CAN.index(nhat_can)]
    ad_ta = CAN_AM_DUONG[CAN.index(nhat_can)]
    hanh_kia = CAN_HANH[CAN.index(can_khac)]
    ad_kia = CAN_AM_DUONG[CAN.index(can_khac)]
    cung_am_duong = (ad_ta == ad_kia)

    if hanh_kia == hanh_ta:
        return "Tỷ Kiên" if cung_am_duong else "Kiếp Tài"
    if SINH.get(hanh_kia) == hanh_ta:
        return "Thiên Ấn" if cung_am_duong else "Chính Ấn"
    if SINH.get(hanh_ta) == hanh_kia:
        return "Thực Thần" if cung_am_duong else "Thương Quan"
    if KHAC.get(hanh_ta) == hanh_kia:
        return "Thiên Tài" if cung_am_duong else "Chính Tài"
    if KHAC.get(hanh_kia) == hanh_ta:
        return "Thất Sát" if cung_am_duong else "Chính Quan"
    return None  # không nên xảy ra nếu dữ liệu đúng


THE_NHOM = {"Chính Ấn", "Thiên Ấn", "Tỷ Kiên", "Kiếp Tài", "Thực Thần", "Thương Quan"}
DUNG_NHOM = {"Chính Tài", "Thiên Tài", "Chính Quan", "Thất Sát"}


def truong_sinh_trang_thai(nhat_can, chi):
    """Trạng thái vòng Trường Sinh của 1 Địa Chi so với Nhật Can."""
    start_chi = TRUONG_SINH_START[nhat_can]
    start_idx = CHI.index(start_chi)
    chi_idx = CHI.index(chi)
    is_duong = CAN_AM_DUONG[CAN.index(nhat_can)] == "Dương"
    if is_duong:
        offset = (chi_idx - start_idx) % 12
    else:
        offset = (start_idx - chi_idx) % 12
    return TRUONG_SINH_STAGES[offset]


# ----------------------------------------------------------------------
# 4. HÀM PHÂN TÍCH CHÍNH
# ----------------------------------------------------------------------

def phan_tich_la_so(nam, thang, ngay, gio, dai_van=None, luu_nien=None, gioi_tinh=None):
    """
    nam, thang, ngay, gio: chuỗi "Can Chi", ví dụ "Mậu Thìn".
    dai_van, luu_nien: tùy chọn, cùng định dạng — nếu có sẽ được đưa vào phần
                        liệt kê quan hệ (để phục vụ Bước 9 luận Đại Vận) nhưng
                        KHÔNG được tính vào Thể/Dụng "trong nhà/ngoài nhà" của
                        nguyên cục.
    gioi_tinh: "Nam" hoặc "Nữ" — chỉ để in kèm trong báo cáo, không dùng tính toán
               (chiều Đại Vận thuận/nghịch để bên references/lap-tu-tru.md xử lý).

    Trả về dict — Claude đọc dict này rồi luận tiếp Bước 3–10 trong SKILL.md.
    """
    tru_input = {"Năm": nam, "Tháng": thang, "Ngày": ngay, "Giờ": gio}
    tru = {}
    for ten, chuoi in tru_input.items():
        can, chi = _split_can_chi(chuoi)
        tru[ten] = {"can": can, "chi": chi}

    nhat_can = tru["Ngày"]["can"]

    # --- 4.1 Thập Thần Can lộ + Can tàng, Trường Sinh mỗi trụ ---
    bang_tru = {}
    for ten in TRU_NAMES:
        can = tru[ten]["can"]
        chi = tru[ten]["chi"]
        tang_can_list = []
        for tang in CHI_TANG_CAN[chi]:
            # Can tàng trùng Nhật Can (hiếm, nhưng lý thuyết có thể xảy ra ở chính
            # Chi trụ Ngày) vẫn tính bình thường — chỉ Can LỘ ở đúng trụ Ngày mới bỏ qua.
            tang_can_list.append({"can": tang, "thap_than": thap_than(nhat_can, tang)})
        thap_than_can_lo = None if ten == "Ngày" else thap_than(nhat_can, can)
        bang_tru[ten] = {
            "can": can,
            "thap_than_can": thap_than_can_lo,
            "chi": chi,
            "chi_tang_can": tang_can_list,
            "truong_sinh_cua_chi": truong_sinh_trang_thai(nhat_can, chi),
            "vi_tri": "trong nhà" if ten in TRONG_NHA else "ngoài nhà",
        }

    # --- 4.2 Tally Thể / Dụng (tính cả Can lộ lẫn Can tàng, gắn theo trụ) ---
    the_list, dung_list = [], []
    for ten in TRU_NAMES:
        entries = [("can", bang_tru[ten]["can"], bang_tru[ten]["thap_than_can"])]
        for t in bang_tru[ten]["chi_tang_can"]:
            entries.append(("chi_tang", t["can"], t["thap_than"]))
        for loai, chu, tt in entries:
            if tt is None:
                continue
            item = {"tru": ten, "vi_tri": bang_tru[ten]["vi_tri"], "loai": loai, "chu": chu, "thap_than": tt}
            if tt in THE_NHOM:
                the_list.append(item)
            elif tt in DUNG_NHOM:
                dung_list.append(item)

    the_trong_nha = [x for x in the_list if x["vi_tri"] == "trong nhà"]
    dung_trong_nha = [x for x in dung_list if x["vi_tri"] == "trong nhà"]
    the_ngoai_nha = [x for x in the_list if x["vi_tri"] == "ngoài nhà"]
    dung_ngoai_nha = [x for x in dung_list if x["vi_tri"] == "ngoài nhà"]

    # --- 4.3 Quan hệ giữa các Chi (bao gồm Đại Vận/Lưu Niên nếu có) ---
    chi_theo_tru = {ten: tru[ten]["chi"] for ten in TRU_NAMES}
    can_theo_tru = {ten: tru[ten]["can"] for ten in TRU_NAMES}
    if dai_van:
        c, h = _split_can_chi(dai_van)
        can_theo_tru["Đại Vận"] = c
        chi_theo_tru["Đại Vận"] = h
    if luu_nien:
        c, h = _split_can_chi(luu_nien)
        can_theo_tru["Lưu Niên"] = c
        chi_theo_tru["Lưu Niên"] = h

    ten_list = list(chi_theo_tru.keys())
    quan_he = []

    # Lục hợp / Lục xung / Lục hại / Lục phá / Ám hợp — duyệt từng cặp trụ
    for i in range(len(ten_list)):
        for j in range(i + 1, len(ten_list)):
            t1, t2 = ten_list[i], ten_list[j]
            c1, c2 = chi_theo_tru[t1], chi_theo_tru[t2]
            cap = frozenset([c1, c2])
            if c1 == c2:
                continue
            if cap in LUC_HOP_CHI:
                quan_he.append({"loai": "Lục hợp", "giua": [t1, t2], "chi": [c1, c2],
                                 "hoa_thanh": LUC_HOP_CHI[cap],
                                 "hieu_suat": HIEU_SUAT_HOP.get(cap, "chưa xếp hạng")})
            if cap in LUC_XUNG_CHI:
                quan_he.append({"loai": "Lục xung", "giua": [t1, t2], "chi": [c1, c2],
                                 "hieu_suat": HIEU_SUAT_XUNG_HINH_HAI.get(cap, "chưa xếp hạng")})
            if cap in LUC_HAI_CHI:
                quan_he.append({"loai": "Lục hại", "giua": [t1, t2], "chi": [c1, c2],
                                 "hieu_suat": HIEU_SUAT_XUNG_HINH_HAI.get(cap, "chưa xếp hạng")})
            if cap in LUC_PHA_CHI:
                quan_he.append({"loai": "Lục phá", "giua": [t1, t2], "chi": [c1, c2]})
            if cap in AM_HOP_CHI:
                quan_he.append({"loai": "Ám hợp", "giua": [t1, t2], "chi": [c1, c2],
                                 "hieu_suat": HIEU_SUAT_HOP.get(cap, "chưa xếp hạng")})
            if cap in TUONG_HINH_DOI:
                quan_he.append({"loai": "Tương hình (vô lễ)", "giua": [t1, t2], "chi": [c1, c2]})

    # Tam hình (bộ 3) — kiểm tra mọi bộ 3 trụ có khớp 1 trong 2 nhóm tam hình
    for i in range(len(ten_list)):
        for j in range(i + 1, len(ten_list)):
            for k in range(j + 1, len(ten_list)):
                t1, t2, t3 = ten_list[i], ten_list[j], ten_list[k]
                bo3 = frozenset([chi_theo_tru[t1], chi_theo_tru[t2], chi_theo_tru[t3]])
                if bo3 in TAM_HINH_NHOM and len(bo3) == 3:
                    quan_he.append({"loai": "Tam hình", "giua": [t1, t2, t3],
                                     "chi": sorted(bo3, key=CHI.index)})

    # Tự hình — Chi thuộc nhóm tự hình xuất hiện từ 2 lần trở lên
    for chi_tu_hinh in TU_HINH_CHI:
        tru_co_chi = [t for t in ten_list if chi_theo_tru[t] == chi_tu_hinh]
        if len(tru_co_chi) >= 2:
            quan_he.append({"loai": "Tự hình", "giua": tru_co_chi, "chi": [chi_tu_hinh] * len(tru_co_chi)})

    # Tam hợp cục / Bán tam hợp — kiểm tra theo từng cục
    chi_present = {t: chi_theo_tru[t] for t in ten_list}
    for hanh, bo3_chi in TAM_HOP_CUC.items():
        matched = [(t, c) for t, c in chi_present.items() if c in bo3_chi]
        chi_matched = sorted(set(c for _, c in matched), key=bo3_chi.index)
        if len(chi_matched) == 3:
            quan_he.append({"loai": "Tam hợp cục (đủ)", "hanh": hanh,
                             "giua": [t for t, c in matched], "chi": chi_matched})
        elif len(chi_matched) == 2:
            quan_he.append({"loai": "Bán tam hợp", "hanh": hanh,
                             "giua": [t for t, c in matched], "chi": chi_matched,
                             "thieu": [c for c in bo3_chi if c not in chi_matched]})

    # Tam hội cục
    for hanh, bo3_chi in TAM_HOI_CUC.items():
        matched = [(t, c) for t, c in chi_present.items() if c in bo3_chi]
        chi_matched = sorted(set(c for _, c in matched), key=bo3_chi.index)
        if len(chi_matched) == 3:
            quan_he.append({"loai": "Tam hội cục (đủ)", "hanh": hanh,
                             "giua": [t for t, c in matched], "chi": chi_matched})

    # Thiên Can Ngũ Hợp — duyệt cặp Can
    can_ten_list = list(can_theo_tru.keys())
    for i in range(len(can_ten_list)):
        for j in range(i + 1, len(can_ten_list)):
            t1, t2 = can_ten_list[i], can_ten_list[j]
            c1, c2 = can_theo_tru[t1], can_theo_tru[t2]
            cap = frozenset([c1, c2])
            if cap in THIEN_CAN_NGU_HOP:
                lien_ke = _lien_ke(t1, t2, TRU_NAMES + (["Đại Vận"] if dai_van else []) + (["Lưu Niên"] if luu_nien else []))
                quan_he.append({"loai": "Thiên Can Ngũ Hợp", "giua": [t1, t2], "can": [c1, c2],
                                 "hoa_thanh_kha_di": THIEN_CAN_NGU_HOP[cap],
                                 "lien_ke_truc_tiep": lien_ke,
                                 "co_nhat_chu_tham_gia": nhat_can in (c1, c2),
                                 "luu_y": "Nếu Nhật Chủ tham gia: CHỈ LUẬN HỢP, KHÔNG LUẬN HÓA (xem hop-hoa-mo-rong.md mục 3)."})

    # --- 4.4 Mộ Khố ---
    mo_kho_list = []
    for ten in TRU_NAMES:
        chi = tru[ten]["chi"]
        if chi in ("Thìn", "Tuất", "Sửu", "Mùi"):
            for hanh, chi_mo in MO_KHO.items():
                if chi_mo == chi:
                    thap_than_hanh = _thap_than_theo_hanh(nhat_can, hanh)
                    mo_kho_list.append({
                        "tru": ten, "chi": chi, "mo_kho_cua_hanh": hanh,
                        "tuong_ung_thap_than": thap_than_hanh,
                        "vi_tri": "trong nhà" if ten in TRONG_NHA else "ngoài nhà",
                        "ghi_chu": "Cần đối chiếu vượng/suy hành này trong cục để biết là Mộ hay Khố (xem mo-kho.md mục 1)."
                    })

    # --- 4.5 Ứng viên "xuất xứ" cho mỗi Thiên Can (đối chiếu Chi tàng toàn cục) ---
    xuat_xu = []
    for ten in TRU_NAMES:
        can = tru[ten]["can"]
        goc_list = []
        for ten2 in TRU_NAMES:
            chi2 = tru[ten2]["chi"]
            if can in CHI_TANG_CAN[chi2]:
                muc_do = "chính khí" if CHI_TANG_CAN[chi2][0] == can else "tàng khí phụ"
                goc_list.append({"tru": ten2, "chi": chi2, "muc_do": muc_do,
                                  "lien_ke_truc_tiep": _lien_ke(ten, ten2, TRU_NAMES)})
        xuat_xu.append({"tru_cua_can": ten, "can": can,
                         "co_can_ngay_tai_tru": can in CHI_TANG_CAN[tru[ten]["chi"]],
                         "goc_khac": goc_list})

    return {
        "nhat_chu": nhat_can,
        "gioi_tinh": gioi_tinh,
        "bang_tru": bang_tru,
        "the_dung": {
            "the_trong_nha": the_trong_nha, "dung_trong_nha": dung_trong_nha,
            "the_ngoai_nha": the_ngoai_nha, "dung_ngoai_nha": dung_ngoai_nha,
            "tong_so_the": len(the_list), "tong_so_dung": len(dung_list),
        },
        "quan_he_can_chi": quan_he,
        "mo_kho": mo_kho_list,
        "xuat_xu_ung_vien": xuat_xu,
        "ghi_chu_cho_claude": (
            "Đây là dữ liệu KHÁCH QUAN. Các bước phán đoán sau đây do Claude thực hiện, "
            "KHÔNG được suy ra tự động từ script này: (1) chọn Tố Công chính trong số các "
            "ứng viên Thể/xuất xứ ở trên — xem to-cong.md; (2) xác định 1 quan hệ hợp có "
            "THẬT SỰ HÓA hay không — xem hop-hoa-mo-rong.md mục 3 (đặc biệt nếu Nhật Chủ "
            "tham gia hợp thì chỉ luận Hợp); (3) xác định Đảng/Thế có 'tạo công' hay không "
            "— xem dang-the.md; (4) xếp cấu trúc vào 1 trong 5 loại và đánh giá Chính/Phản "
            "Cục — xem cau-truc-to-cong.md và chinh-cuc-phan-cuc.md; (5) mọi kết luận về "
            "nghề nghiệp, phú quý, hôn nhân, sức khỏe."
        ),
    }


def _thap_than_theo_hanh(nhat_can, hanh_kia):
    """Thập Thần của 1 HÀNH (không phải 1 Can cụ thể) so với Nhật Can — dùng cho Mộ Khố,
    trả về tên nhóm chung (không phân Âm/Dương) vì Mộ Khố không có Âm Dương riêng."""
    hanh_ta = CAN_HANH[CAN.index(nhat_can)]
    if hanh_kia == hanh_ta:
        return "Tỷ Kiếp"
    if SINH.get(hanh_kia) == hanh_ta:
        return "Ấn"
    if SINH.get(hanh_ta) == hanh_kia:
        return "Thực Thương"
    if KHAC.get(hanh_ta) == hanh_kia:
        return "Tài"
    if KHAC.get(hanh_kia) == hanh_ta:
        return "Quan Sát"
    return None


def _lien_ke(t1, t2, thu_tu):
    """2 trụ có liền kề nhau trong thứ tự Năm-Tháng-Ngày-Giờ(-Đại Vận-Lưu Niên) không."""
    try:
        i1, i2 = thu_tu.index(t1), thu_tu.index(t2)
        return abs(i1 - i2) == 1
    except ValueError:
        return False


# ----------------------------------------------------------------------
# 5. CLI
# ----------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="Tính toán khách quan cho luận Bát Tự Manh Phái.")
    ap.add_argument("--nam", required=True, help="Can Chi trụ Năm, vd 'Mậu Thìn'")
    ap.add_argument("--thang", required=True, help="Can Chi trụ Tháng")
    ap.add_argument("--ngay", required=True, help="Can Chi trụ Ngày")
    ap.add_argument("--gio", required=True, help="Can Chi trụ Giờ")
    ap.add_argument("--dai-van", default=None, help="Can Chi Đại Vận đang xét (tùy chọn)")
    ap.add_argument("--luu-nien", default=None, help="Can Chi Lưu Niên đang xét (tùy chọn)")
    ap.add_argument("--gioi-tinh", default=None, choices=["Nam", "Nữ"], help="Giới tính (chỉ để ghi chú)")
    args = ap.parse_args()

    try:
        report = phan_tich_la_so(
            args.nam, args.thang, args.ngay, args.gio,
            dai_van=args.dai_van, luu_nien=args.luu_nien, gioi_tinh=args.gioi_tinh,
        )
    except ValueError as e:
        print(f"Lỗi input: {e}", file=sys.stderr)
        sys.exit(1)

    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
