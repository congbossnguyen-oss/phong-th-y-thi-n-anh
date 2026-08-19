#!/usr/bin/env python3
"""
Kiểm tra 2 file có KHỚP TUYỆT ĐỐI chưa, trước khi giao Claude Code.
Chạy:  python3 validate_mapping.py career_mapping.json domain_mapping.json
Exit code 0 = pass, 1 = còn lỗi.
"""
import json, sys

def load(p):
    try: return json.load(open(p, encoding="utf-8"))
    except Exception as e:
        print(f"  ✗ Không đọc được {p}: {e}"); sys.exit(1)

def main():
    if len(sys.argv) != 3:
        print("Dùng: python3 validate_mapping.py career_mapping.json domain_mapping.json"); sys.exit(1)
    cm, dm = load(sys.argv[1]), load(sys.argv[2])
    errs, warns = [], []

    # 1. career_vector chỉ được ở career_mapping
    def has_vec(obj):
        if isinstance(obj, dict):
            if "career_vector" in obj: return True
            return any(has_vec(v) for v in obj.values())
        return False
    if has_vec(dm):
        errs.append("domain_mapping VẪN còn 'career_vector' -> phải xóa (nguồn duy nhất là career_mapping).")

    # 2. tập key phải trùng
    c = cm.get("_contract", {})
    checks = [
        ("archetype", c.get("archetype_keys", []),
         set(dm.get("archetypes", {})) - {"_role"}),
        ("mechanism", c.get("mechanism_keys", []),
         set(dm.get("mechanisms", {})) - {"_role"}),
    ]
    for name, cm_keys, dm_keys in checks:
        cm_set = set(cm_keys)
        only_cm, only_dm = cm_set - dm_keys, dm_keys - cm_set
        if only_cm: errs.append(f"{name}: có ở career_mapping, THIẾU ở domain_mapping: {sorted(only_cm)}")
        if only_dm: errs.append(f"{name}: có ở domain_mapping, THIẾU ở career_mapping: {sorted(only_dm)}")

    # 3. 6 cách phụ Tam Hợp: tập key phải trùng (điều kiện chặn)
    phu = set(c.get("phu_cach_keys", []))
    dm_phu = set(dm.get("tam_hop_phu_cach", {})) - {"_role"}
    only_cm, only_dm = phu - dm_phu, dm_phu - phu
    if only_cm: errs.append(f"phu_cach: có ở career_mapping, THIẾU ở domain_mapping: {sorted(only_cm)}")
    if only_dm: errs.append(f"phu_cach: có ở domain_mapping, THIẾU ở career_mapping: {sorted(only_dm)}")

    # 4. mọi archetype/mechanism/phu_cach domain phải đủ 10 domain key
    cat = set(dm.get("domain_catalog", {}))
    for sec in ("archetypes", "tam_hop_phu_cach", "mechanisms"):
        for k, v in dm.get(sec, {}).items():
            if k == "_role": continue
            d = set(v.get("domains", {}))
            if d != cat:
                errs.append(f"{sec}.{k}: domain key lệch catalog (thiếu {sorted(cat-d)}, thừa {sorted(d-cat)})")

    # 5. luật 3+3+3 và khử trùng phải tồn tại
    txt = json.dumps(dm, ensure_ascii=False).lower()
    if not any(w in txt for w in ["priority", "ưu tiên", "3+3+3", "output_rule", "selection"]):
        warns.append("Không thấy luật xếp 3 ưu tiên/3 phù hợp/3 có thể (section 19).")
    if "dedup" not in txt and "khử trùng" not in txt and "duplicate" not in txt:
        warns.append("Không thấy luật khử trùng ngành (Đầu tư/Marketing).")

    print("=== KẾT QUẢ ===")
    if errs:
        print("🔴 LỖI (phải sửa):")
        for e in errs: print("   -", e)
    if warns:
        print("🟡 CẢNH BÁO (nên xem):")
        for w in warns: print("   -", w)
    if not errs and not warns:
        print("✅ Hai file khớp tuyệt đối, sẵn sàng cho Claude Code.")
    elif not errs:
        print("✅ Không có lỗi chặn. Chỉ còn cảnh báo ở trên.")
    sys.exit(1 if errs else 0)

if __name__ == "__main__":
    main()
