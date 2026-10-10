-- Development-only fixtures. Runner permits expiry_dev only and serializes reruns.
-- No REPLACE, overwrite UPDATE or destructive cleanup; existing fixtures remain untouched.
START TRANSACTION;
INSERT INTO users(id,identity_subject,display_name,timezone)
SELECT '00000000-0000-4000-8000-000000000001','dev:owner-a','Test owner A','Asia/Ho_Chi_Minh'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id='00000000-0000-4000-8000-000000000001');
INSERT INTO users(id,identity_subject,display_name,timezone)
SELECT '00000000-0000-4000-8000-000000000002','dev:owner-b','Test owner B','America/Los_Angeles'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id='00000000-0000-4000-8000-000000000002');

INSERT INTO food_entries(id,user_id,name,storage_location,remaining_quantity,unit,expiry_date,date_certainty,date_source,date_label_type,version)
SELECT '10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','Rice','Kitchen',750,'g','2026-11-30','known','printed_label','best_before',2
WHERE NOT EXISTS (SELECT 1 FROM food_entries WHERE id='10000000-0000-4000-8000-000000000001');
INSERT INTO food_entries(id,user_id,name,storage_location,remaining_quantity,unit,expiry_date,date_certainty,date_source,date_label_type,version)
SELECT '10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','Milk','Fridge',0,'ml','2026-10-10','known','printed_label','use_by',3
WHERE NOT EXISTS (SELECT 1 FROM food_entries WHERE id='10000000-0000-4000-8000-000000000002');
INSERT INTO food_entries(id,user_id,name,storage_location,remaining_quantity,unit,version)
SELECT '10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000002','Vegetables','Fridge',450,'g',2
WHERE NOT EXISTS (SELECT 1 FROM food_entries WHERE id='10000000-0000-4000-8000-000000000003');
INSERT INTO food_entries(id,user_id,name,storage_location,remaining_quantity,unit,expiry_date,date_certainty,date_source,date_label_type)
SELECT '10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000002','Bananas','Counter',4,'piece','2026-10-11','estimated','user_estimate','unspecified'
WHERE NOT EXISTS (SELECT 1 FROM food_entries WHERE id='10000000-0000-4000-8000-000000000004');

INSERT INTO stock_movements(id,entry_id,kind,quantity_before,quantity_after,reason,recorded_at)
SELECT seed.* FROM (
 SELECT '20000000-0000-4000-8000-000000000001' id,'10000000-0000-4000-8000-000000000001' entry_id,'initial' kind,0 quantity_before,1000 quantity_after,NULL reason,CAST('2026-10-01 12:00:00' AS DATETIME) recorded_at
 UNION ALL SELECT '20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','consume',1000,750,'Dinner','2026-10-02 12:00:00'
 UNION ALL SELECT '20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002','initial',0,500,NULL,'2026-10-01 12:00:00'
 UNION ALL SELECT '20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000002','consume',500,300,'Breakfast','2026-10-02 12:00:00'
 UNION ALL SELECT '20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000002','discard',300,0,'Reported disposal','2026-10-03 12:00:00'
 UNION ALL SELECT '20000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000003','initial',0,500,NULL,'2026-10-01 12:00:00'
 UNION ALL SELECT '20000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000003','adjustment',500,450,'Physical recount','2026-10-02 12:00:00'
 UNION ALL SELECT '20000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000004','initial',0,4,NULL,'2026-10-01 12:00:00'
) seed WHERE NOT EXISTS (SELECT 1 FROM stock_movements existing WHERE existing.id=seed.id);
COMMIT;
