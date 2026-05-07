-- ============================================================
-- Masters Application Tracker : Data Migration SQL
-- Generated from: universities.csv + application_state.json
--                 + scholarships_state.json
--
-- HOW TO USE:
--   1. Open Supabase → SQL Editor
--   2. Replace YOUR_USER_ID_HERE with your actual Supabase Auth user ID
--      (find it in Authentication → Users tab)
--   3. Paste this entire file and click Run
-- ============================================================

-- Set your user ID here (copy from Authentication → Users in Supabase)
DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_ID_HERE';  -- ← REPLACE THIS
BEGIN

  -- ──────────────────────────────────────────────────────────
  -- 1. UNIVERSITIES
  -- ──────────────────────────────────────────────────────────
  INSERT INTO universities (id, user_id, name, region, tuition, currency, start_date, deadline, status, notes, application_link)
  VALUES
    ('7aaa5c46-784f-558b-0550-1ec6e50f7473', v_user_id, 'Abertay University (Scotland)', 'Europe', 19950.0, 'GBP', '2025-09-01', '2026-01-28', 'accepted', '1. Awaiting Decision on Commonwealth Application.', 'https://oasis.abertay.ac.uk/oasis/sits.urd/run/siw_lgn'),
    ('604087d8-0614-6c41-d92e-66a059422068', v_user_id, 'Chalmers University of Technology (Sweden)', 'Europe', 29280.0, 'EUR', '2025-10-16', '2026-01-15', 'waitlisted', '', 'https://www.universityadmissions.se/intl/start'),
    ('dd41c62c-29fa-8723-a074-0ed4fd6b8304', v_user_id, 'CyberMACS (Europe)', 'Europe', 5175.0, 'EUR', '2025-09-01', '2025-12-15', 'submitted', '1. Awaiting Interview & Examination Invitation.', 'https://www.cybermacs.eu/form/signin.html'),
    ('d4f33618-c8e1-34e9-09db-eb895f5d9f05', v_user_id, 'Loughborough University (London)', 'Europe', 29950.0, 'GBP', '2025-09-01', '2026-01-28', 'accepted', '1. Awaiting Decision on Commonwealth Application.
2. Awaiting Decision on Loughborough International Scholarship', 'https://lucas.lboro.ac.uk/web_apx/f?p=100:101::::::'),
    ('cf761589-cea2-ac87-e325-de96a9f23422', v_user_id, 'New York University (USA)', 'USA', 22725.0, 'USD', '2025-09-06', '2026-01-28', 'accepted', '1. Applying for Scholarships.', 'https://apply.engineering.nyu.edu/apply/'),
    ('e344a6a8-e958-c702-2c61-32ae7db55d11', v_user_id, 'University of Bradford (Bradford)', 'Europe', 25389.0, 'GBP', '2025-09-01', '2026-01-28', 'accepted', '1. Awaiting Decision on Commonwealth Application.', 'https://evision.brad.ac.uk/urd/sits.urd/run/SIW_LGN?htv=APP'),
    ('eca8d1c3-9872-b975-11fb-a645d9d863bb', v_user_id, 'KTH Royal Institute of Technology (Sweden)', 'Europe', 32940.0, 'EUR', '2025-10-16', '2026-01-15', 'waitlisted', '', 'https://www.universityadmissions.se/intl/start'),
    ('e5248b14-5a19-eed9-ad25-accc17fa3525', v_user_id, 'Luleå University of Technology (Sweden)', 'Europe', 25620.0, 'EUR', '2025-10-16', '2026-01-15', 'rejected', '', 'https://www.universityadmissions.se/intl/start'),
    ('89f5d3d5-1d7b-ca9f-6464-689557188473', v_user_id, 'Linköping University (Sweden)', 'Europe', 30378.0, 'EUR', '2025-10-16', '2026-01-15', 'accepted', '', 'https://www.universityadmissions.se/intl/start'),
    ('5b6168af-2623-aa20-fd80-454d40c592af', v_user_id, 'CyberSURE (Europe)', 'Europe', 18000.0, 'EUR', '2025-11-15', '2026-01-05', 'rejected', '', 'https://fsweb.no/soknadsweb/login.jsf?inst=ntnu')
  ON CONFLICT (id) DO NOTHING;

  -- ──────────────────────────────────────────────────────────
  -- 2. UNIVERSITY CHECKLISTS
  -- ──────────────────────────────────────────────────────────
  INSERT INTO checklist (id, university_id, item, completed)
  VALUES
    ('0a3eb6f0-e9cf-da4d-01d5-3f44a3f2fadd', '7aaa5c46-784f-558b-0550-1ec6e50f7473', 'CV/Resume', TRUE),
    ('8cbc7b7f-4a6a-25d1-e971-4bedaed26f80', '7aaa5c46-784f-558b-0550-1ec6e50f7473', 'Statement of Purpose', TRUE),
    ('a826738f-f01f-e63d-5e93-d534fe4f3df4', '7aaa5c46-784f-558b-0550-1ec6e50f7473', 'Recommendation Letters', TRUE),
    ('8e39aa3e-e256-35ff-9006-b6013431a285', '7aaa5c46-784f-558b-0550-1ec6e50f7473', 'Transcripts', TRUE),
    ('15b11bd3-cbd2-608d-4828-1c70bb23cb9b', '7aaa5c46-784f-558b-0550-1ec6e50f7473', 'English Test (TOEFL/IELTS)', TRUE),
    ('5a345c15-e58e-b95c-db14-7313c0a23e1f', '7aaa5c46-784f-558b-0550-1ec6e50f7473', 'Commonwealth Scholarship Application', TRUE),
    ('9007d9a8-c552-46a3-1c00-92ec883b4323', '604087d8-0614-6c41-d92e-66a059422068', 'Passport', TRUE),
    ('b7ec4a44-f48c-1c7a-5f51-bd7b20cd92bb', '604087d8-0614-6c41-d92e-66a059422068', 'Degree Certificate', TRUE),
    ('d870267b-f96c-8bc8-4e21-ca0bfa8c741b', '604087d8-0614-6c41-d92e-66a059422068', 'Academic Transcripts', TRUE),
    ('a1b12ec2-bd11-5ece-54bb-0ff259ea6ec0', '604087d8-0614-6c41-d92e-66a059422068', 'English Language Proficiency (TOEFL)', TRUE),
    ('3714528d-f6d0-87c4-17c9-9a821258f5c7', '604087d8-0614-6c41-d92e-66a059422068', 'Recommendation Letter 1 - Academic', TRUE),
    ('de475c71-0bc4-f586-1d44-8c0bfda8bb0c', '604087d8-0614-6c41-d92e-66a059422068', 'Recommendation Letter 2 - Professional', TRUE),
    ('315c2076-91ee-7a69-9bb3-a88b1ad31519', '604087d8-0614-6c41-d92e-66a059422068', 'Curriculum Vitae (CV)', TRUE),
    ('56151fe6-4485-ae4c-5777-fffbf0600161', '604087d8-0614-6c41-d92e-66a059422068', 'Motivation Letter', TRUE),
    ('85e06381-b956-9698-804a-742dd7dc877b', '604087d8-0614-6c41-d92e-66a059422068', 'Specific Entry Requirements Form', TRUE),
    ('6567a137-5fa2-1650-ae3f-f4e3a79cf96f', '604087d8-0614-6c41-d92e-66a059422068', 'Relevant Course Descriptions/Syllabi', TRUE),
    ('61de8820-5272-0579-e9ee-05073b9b1066', '604087d8-0614-6c41-d92e-66a059422068', 'Application Fee', TRUE),
    ('85618fd4-f493-b0db-510d-dc886eeb28eb', 'dd41c62c-29fa-8723-a074-0ed4fd6b8304', 'Curriculum Vitae (CV)', TRUE),
    ('92e3925b-70d2-ef94-0b30-5d0c0ad4b8d6', 'dd41c62c-29fa-8723-a074-0ed4fd6b8304', 'Cover Letter (CL)', TRUE),
    ('754c16bd-ad15-a66d-1105-fc8edc75c782', 'dd41c62c-29fa-8723-a074-0ed4fd6b8304', 'Graduate Diploma', TRUE),
    ('ccab9fdb-e8f1-3868-57a2-ccd3364d1e0f', 'dd41c62c-29fa-8723-a074-0ed4fd6b8304', 'High School Diploma', TRUE),
    ('e605ad8c-4180-6130-3ba1-0ab38c456c6e', 'dd41c62c-29fa-8723-a074-0ed4fd6b8304', 'Transcript', TRUE),
    ('a5226896-2638-0b6e-1b99-f6d9f9209711', 'dd41c62c-29fa-8723-a074-0ed4fd6b8304', 'Passport', TRUE),
    ('a2e5b0d9-ada8-a253-953e-c3642af84e6b', 'dd41c62c-29fa-8723-a074-0ed4fd6b8304', 'Certificate of English Language Proficiency (TOEFL)', TRUE),
    ('33815a76-b23c-4fd8-b057-3fd2b4f60176', 'dd41c62c-29fa-8723-a074-0ed4fd6b8304', 'Proof of Residence', TRUE),
    ('ef26d301-906a-c090-20d7-322a44e9bd6d', 'dd41c62c-29fa-8723-a074-0ed4fd6b8304', 'Publication (Final Year Thesis)', TRUE),
    ('69c6bf7e-d75d-33de-b522-7783c78a385b', 'dd41c62c-29fa-8723-a074-0ed4fd6b8304', 'Recommendation Letter 1 - Academic', TRUE),
    ('c2e3bd29-a3a5-bdc0-fd15-a93a04785bf5', 'dd41c62c-29fa-8723-a074-0ed4fd6b8304', 'Recommendation Letter 2 - Personal', TRUE),
    ('f1c0e294-8699-45ee-1975-9f2f90411062', 'dd41c62c-29fa-8723-a074-0ed4fd6b8304', 'Recommendation Letter 3 - Professional', TRUE),
    ('b8f095f4-3554-698a-5b45-3cf81e74319e', 'dd41c62c-29fa-8723-a074-0ed4fd6b8304', 'Cybersecurity Related Work & Certificate Document 1 - Introduction to Cybersecurity', TRUE),
    ('46353135-184b-7e11-018d-639246d6cd75', 'dd41c62c-29fa-8723-a074-0ed4fd6b8304', 'Cybesecurity Related Work & Certificate Document 2 - Networking Basics', TRUE),
    ('980d0f99-1455-f2d4-09a2-b0c63dcc888f', 'd4f33618-c8e1-34e9-09db-eb895f5d9f05', 'CV/Resume', TRUE),
    ('4b9ee6ce-2b30-cc3c-8796-6648d9448c15', 'd4f33618-c8e1-34e9-09db-eb895f5d9f05', 'Statement of Purpose', TRUE),
    ('f2829cd7-8d63-bbef-57a1-6b693096b057', 'd4f33618-c8e1-34e9-09db-eb895f5d9f05', 'Recommendation Letters', TRUE),
    ('bc324b4d-dc00-da16-d43d-531797124431', 'd4f33618-c8e1-34e9-09db-eb895f5d9f05', 'Transcripts', TRUE),
    ('35d96f17-c5d9-7b24-b8f9-ce5c70908134', 'd4f33618-c8e1-34e9-09db-eb895f5d9f05', 'English Test (TOEFL/IELTS)', TRUE),
    ('d73d4da8-c90d-6f51-283e-058c26363492', 'd4f33618-c8e1-34e9-09db-eb895f5d9f05', 'Commonwealth Scholarship Application', TRUE),
    ('47bb37d1-0fcb-6bc3-6e9f-4fd1a181ba21', 'cf761589-cea2-ac87-e325-de96a9f23422', 'CV/Resume', TRUE),
    ('f0164494-623d-b0a4-ad0a-14947fbcdf3c', 'cf761589-cea2-ac87-e325-de96a9f23422', 'Statement of Purpose', TRUE),
    ('57701ba1-53e8-d14c-c448-e7f413d79fbc', 'cf761589-cea2-ac87-e325-de96a9f23422', 'Recommendation Letters', TRUE),
    ('fda61421-86f5-dc5a-762c-c138d483f084', 'cf761589-cea2-ac87-e325-de96a9f23422', 'Transcripts', TRUE),
    ('5390b9d7-e8c9-735d-d479-cb5195882497', 'cf761589-cea2-ac87-e325-de96a9f23422', 'English Test (TOEFL/IELTS)', TRUE),
    ('478d9911-d6c9-e63f-d8f4-678949df9b41', 'e344a6a8-e958-c702-2c61-32ae7db55d11', 'CV/Resume', TRUE),
    ('bfaf6cb1-3cdc-98a2-654c-6c9085e33f42', 'e344a6a8-e958-c702-2c61-32ae7db55d11', 'Statement of Purpose', TRUE),
    ('d33946a4-a54f-740e-7804-b2e36412dc0e', 'e344a6a8-e958-c702-2c61-32ae7db55d11', 'Recommendation Letters', TRUE),
    ('233626c6-350c-54e0-c943-fc3f630c280f', 'e344a6a8-e958-c702-2c61-32ae7db55d11', 'Transcripts', TRUE),
    ('efd1ae5c-fd12-1af9-b2cd-874464285d6a', 'e344a6a8-e958-c702-2c61-32ae7db55d11', 'English Test (TOEFL/IELTS)', TRUE),
    ('676ff8d9-04f4-a62a-0aae-3bbbfc57b367', 'e344a6a8-e958-c702-2c61-32ae7db55d11', 'Commonwealth Scholarship Application', TRUE),
    ('16d9b912-0a67-891f-58ce-0ebada16680e', 'eca8d1c3-9872-b975-11fb-a645d9d863bb', 'Passport', TRUE),
    ('e0666b3f-7dae-6cde-c31d-2562346082d5', 'eca8d1c3-9872-b975-11fb-a645d9d863bb', 'Degree Certificate', TRUE),
    ('7a659554-892e-573c-e466-5113ef7e28e4', 'eca8d1c3-9872-b975-11fb-a645d9d863bb', 'Academic Transcripts', TRUE),
    ('a2bfdfdb-006d-1139-0e74-07e53c681cdb', 'eca8d1c3-9872-b975-11fb-a645d9d863bb', 'English Language Proficiency (TOEFL)', TRUE),
    ('9d1be01b-4389-00d7-fccd-853a36331be4', 'eca8d1c3-9872-b975-11fb-a645d9d863bb', 'Recommendation Letter 1 - Academic', TRUE),
    ('16312036-dab6-4f4a-0c2a-1be662f61961', 'eca8d1c3-9872-b975-11fb-a645d9d863bb', 'Recommendation Letter 2 - Professional', TRUE),
    ('73c647b2-5c2f-7f87-b6d6-fc100e2ac0e3', 'eca8d1c3-9872-b975-11fb-a645d9d863bb', 'Curriculum Vitae (CV)', TRUE),
    ('677da016-96a9-9a96-ad0b-142439f0d93e', 'eca8d1c3-9872-b975-11fb-a645d9d863bb', 'Motivation Letter', TRUE),
    ('3ffaeb8e-a7f1-4700-1520-59abcd950960', 'eca8d1c3-9872-b975-11fb-a645d9d863bb', 'Summary Sheet', TRUE),
    ('d3857e3a-e56d-4d4d-a2f2-09acc3829e9e', 'eca8d1c3-9872-b975-11fb-a645d9d863bb', 'Relevant Course Descriptions/Syllabi', TRUE),
    ('d1868d49-48e9-092a-2242-36bf5f1942fb', 'eca8d1c3-9872-b975-11fb-a645d9d863bb', 'Application Fee', TRUE),
    ('a448346e-24f9-f20b-3eeb-e679f17983d8', 'e5248b14-5a19-eed9-ad25-accc17fa3525', 'Passport', TRUE),
    ('c1fb66f7-82bb-e228-121f-4009be552e6e', 'e5248b14-5a19-eed9-ad25-accc17fa3525', 'Degree Certificate', TRUE),
    ('9d341268-8d61-7026-ed89-0be1e9328777', 'e5248b14-5a19-eed9-ad25-accc17fa3525', 'Academic Transcripts', TRUE),
    ('1b867cea-0575-5b41-2d55-aa0344b9d48e', 'e5248b14-5a19-eed9-ad25-accc17fa3525', 'English Language Proficiency (TOEFL)', TRUE),
    ('71634853-c6cb-0d1a-98ea-5999e1484ec4', 'e5248b14-5a19-eed9-ad25-accc17fa3525', 'Recommendation Letter 1 - Academic', TRUE),
    ('9ef87f54-9031-89c7-e513-cafcd4554fb8', 'e5248b14-5a19-eed9-ad25-accc17fa3525', 'Recommendation Letter 2 - Professional', TRUE),
    ('6077ed88-ad42-c32e-0672-fdf456dd50de', 'e5248b14-5a19-eed9-ad25-accc17fa3525', 'Curriculum Vitae (CV)', TRUE),
    ('1543f4f5-bed3-efe1-d4ee-c4e6875f37ba', 'e5248b14-5a19-eed9-ad25-accc17fa3525', 'Application Fee', TRUE),
    ('36a829ba-574d-28f4-ecbe-f762b245bfc2', '89f5d3d5-1d7b-ca9f-6464-689557188473', 'Passport', TRUE),
    ('271a7f1a-8414-a41c-77d7-0237b8b9e016', '89f5d3d5-1d7b-ca9f-6464-689557188473', 'Degree Certificate', TRUE),
    ('322d9469-1aeb-93dd-1d78-817914800dc0', '89f5d3d5-1d7b-ca9f-6464-689557188473', 'Academic Transcripts', TRUE),
    ('2a52f060-863a-d521-0f40-31480ee9742f', '89f5d3d5-1d7b-ca9f-6464-689557188473', 'English Language Proficiency (TOEFL)', TRUE),
    ('b3820b3e-443d-9eac-9fc9-c82b846ffd79', '89f5d3d5-1d7b-ca9f-6464-689557188473', 'Recommendation Letter 1 - Academic', TRUE),
    ('7a6648fe-cf41-d585-c386-0098ea65efca', '89f5d3d5-1d7b-ca9f-6464-689557188473', 'Recommendation Letter 2 - Professional', TRUE),
    ('46df40f1-3be7-4f44-4a2c-d859715aeb2a', '89f5d3d5-1d7b-ca9f-6464-689557188473', 'Curriculum Vitae (CV)', TRUE),
    ('7acdf696-ae3a-68ff-1632-f646ad30b7b7', '89f5d3d5-1d7b-ca9f-6464-689557188473', 'Application Fee', TRUE),
    ('d04e0c75-2448-9312-4ee3-6188e95401af', '5b6168af-2623-aa20-fd80-454d40c592af', 'Bachelor''s Degree Certificate/Diploma', TRUE),
    ('d99a2e02-ca55-0604-b7c0-aaf95f323a8c', '5b6168af-2623-aa20-fd80-454d40c592af', 'Official Transcript of Records', TRUE),
    ('5c44b752-654e-9cab-196f-f17b0f2e0298', '5b6168af-2623-aa20-fd80-454d40c592af', 'Motivation Video', TRUE),
    ('fb4881d4-514d-3fdb-2e81-1218bb231c74', '5b6168af-2623-aa20-fd80-454d40c592af', 'Motivation Letter', TRUE),
    ('96e85a5c-aacf-5515-8583-9f450c72d624', '5b6168af-2623-aa20-fd80-454d40c592af', 'Curriculum Vitae', TRUE),
    ('72f15e33-0f5b-6a3d-dda4-878923cc5c66', '5b6168af-2623-aa20-fd80-454d40c592af', 'Valid Passport or ID', TRUE),
    ('8c549313-1aba-946c-3e5b-5f74841a7f5b', '5b6168af-2623-aa20-fd80-454d40c592af', 'Proof of Place of Residency', TRUE),
    ('8d1f643c-e00e-458e-e49e-7c095c6e16cd', '5b6168af-2623-aa20-fd80-454d40c592af', 'Proof of English Language Proficiency', TRUE),
    ('081680f1-b6ce-22d8-75f7-9f59de07ebd8', '5b6168af-2623-aa20-fd80-454d40c592af', 'Recommendation Letter 1 - Academic', TRUE),
    ('7009d300-5bae-a4d1-1bac-48954fcb9a25', '5b6168af-2623-aa20-fd80-454d40c592af', 'Recommendation Letter 1 - Professional', TRUE),
    ('70b874b7-3ac4-6264-9c36-59f6b3c1af0f', '5b6168af-2623-aa20-fd80-454d40c592af', 'Course Descriptions', TRUE),
    ('83403f4f-0adb-5229-c76e-5becd9c307ae', '5b6168af-2623-aa20-fd80-454d40c592af', 'Work Certifications 1 - 4', TRUE)
  ON CONFLICT (id) DO NOTHING;

  -- ──────────────────────────────────────────────────────────
  -- 3. SCHOLARSHIPS
  -- ──────────────────────────────────────────────────────────
  INSERT INTO scholarships (id, user_id, name, amount, currency, coverage, status, notes, link, start_date, deadline)
  VALUES
    ('28d5d293-68cd-99ef-2719-8dab27240ddd', v_user_id, 'Commonwealth Master''s Scholarships', 45000.0, 'GBP', 'Full Scholarship', 'submitted', '1. Awaiting Commonwealth Interview Invitation.', 'https://aocu-prod.appianportals.com/8203efea-93f7-455c-b40b-7e7b62c938ce-applications', '2025-09-14', '2025-10-14'),
    ('bb3801e7-14d8-9c23-3382-98cee27b215a', v_user_id, 'NYU Tandon Merit Scholarship', 3000.0, 'USD', 'Full Scholarship', 'awarded', '1. Awarded a $3000 scholarship upon admission.
2. No separate application needed.', '', '2025-09-01', '2026-02-02'),
    ('faf0520b-51d4-90b8-0340-744fb25ded7c', v_user_id, 'SEED Global Education (NYU Scholarship)', 20000.0, 'USD', 'Tuition Only', 'rejected', 'Up to $20,000 (one-time award)', 'https://seedglobaleducation.com/study-abroad/scholarships/new-york-university-tandon-school-of-engineering', '2025-09-07', '2026-03-15'),
    ('4128c014-1f2f-2556-118b-02017e824ce9', v_user_id, 'GETFund Foreign Postgraduate Scholarship', 0.0, 'GBP', 'Full Scholarship', 'in-progress', 'The scholarship will help me cover my living expenses for schools that offer only scholarships for tuition.', 'https://scholarships.getfund.gov.gh/auth/login', '2026-04-13', '2026-04-30'),
    ('d8cf7925-16ee-0826-ee06-76ea8800cad5', v_user_id, 'The Avancez/IPOET Scholarships', 240000.0, 'SEK', 'Full Scholarship', 'submitted', 'A 75% reduction of the tuition fees (4 semesters/2 year programme). May be increased to 85% if student excels in their first year of studies.', 'https://www.chalmers.se/en/education/application-and-admission/scholarships-for-fee-paying-students/', '2025-11-20', '2026-01-15'),
    ('f989f356-f70e-dedb-5f6a-4d9272ea4906', v_user_id, 'The Adlerbert Study Scholarships', 320000.0, 'GHS', 'Full Scholarship', 'submitted', 'Covers 100% of the tuition fees (4 semesters/2 year programme)', 'https://www.chalmers.se/en/education/application-and-admission/scholarships-for-fee-paying-students/', '2025-11-20', '2026-01-15'),
    ('b020dd3d-cec5-36d7-8be7-0803e35f92f8', v_user_id, 'Abertay International Scholarship', 3000.0, 'GBP', 'Tuition Only', 'awarded', 'No separate application needed', 'https://oasis.abertay.ac.uk/oasis/sits.urd/run/siw_lgn', '2025-11-15', '2025-11-15'),
    ('da29cc2c-8399-ddb9-283e-9ef17c571bfb', v_user_id, 'Loughborough Excellence Scholarship', 5990.0, 'GBP', 'Tuition Only', 'awarded', 'Automatically awared if eligible.', '', '2025-12-13', '2025-12-13'),
    ('f91c2e62-4499-f5b5-5655-4dd4a65fe4dd', v_user_id, 'Principal''s Excellence Scholarship', 4000.0, 'GBP', 'Tuition Only', 'awarded', '', '', '2026-01-27', '2026-01-27'),
    ('c55e0dd5-8168-b109-0383-0c5ffa6b6aee', v_user_id, 'Loughborough International Scholarships', 29950.0, 'GBP', 'Tuition Only', 'submitted', '1. Includes: Global  Impact (100%),  Global Excellence (90%) & Development Trust Scholarships(100%)', '', '2026-01-22', '2026-04-15')
  ON CONFLICT (id) DO NOTHING;

  -- ──────────────────────────────────────────────────────────
  -- 4. SCHOLARSHIP CHECKLISTS (requirements)
  -- ──────────────────────────────────────────────────────────
  INSERT INTO scholarship_checklist (id, scholarship_id, item, completed)
  VALUES
    ('47c93842-0d6a-ef44-63fb-a6a50defcd4b', '28d5d293-68cd-99ef-2719-8dab27240ddd', 'Commonwealth Application Form', TRUE),
    ('47bac0f9-6889-8e7e-ddd5-4f993425f791', '28d5d293-68cd-99ef-2719-8dab27240ddd', 'Ghana Scholarship Secretariat Official Nomination', TRUE),
    ('55addded-44e7-f5a7-a025-5c0a2aad5278', '4128c014-1f2f-2556-118b-02017e824ce9', 'Admission Letter from accredited University (Unconditional & Financial Condition letters only)', FALSE),
    ('8bab3924-dc7c-1da7-8f8f-1fcf2ebf868a', '4128c014-1f2f-2556-118b-02017e824ce9', 'Fee Schedule', FALSE),
    ('519b19ef-2426-76b3-2b3f-ddc855dc483a', '4128c014-1f2f-2556-118b-02017e824ce9', 'Previous academic certificates (where applicable)', FALSE),
    ('393a4fb9-aab6-fee8-cd3f-08999be56382', '4128c014-1f2f-2556-118b-02017e824ce9', 'Previous transcript (where applicable)', FALSE),
    ('30be50b9-eb67-02c9-1856-94c6fd4c282d', '4128c014-1f2f-2556-118b-02017e824ce9', 'Project or Research proposal (not exceeding 5 pages) (Masters and PhD Applicants)', FALSE),
    ('ed1c8768-0393-8eba-7835-6bb115dd21c1', '4128c014-1f2f-2556-118b-02017e824ce9', 'Curriculum Vitae', FALSE),
    ('ba54be89-3de3-1e5f-9d78-2c574dc83d8e', '4128c014-1f2f-2556-118b-02017e824ce9', 'Academic Referees', FALSE),
    ('4dc4cd0d-a7b5-4690-850e-df9930ca9326', '4128c014-1f2f-2556-118b-02017e824ce9', 'Letter of Recommendation (occupational)', FALSE),
    ('4444b4d1-54be-d266-41c0-c3ed5b316b09', '4128c014-1f2f-2556-118b-02017e824ce9', 'Support Document from employer for Academic Leave (where applicable)', FALSE),
    ('e9e507ee-7e06-a84b-deee-f93a6154e3ae', '4128c014-1f2f-2556-118b-02017e824ce9', 'National Service certificate. (where applicable)', FALSE),
    ('f240a219-7714-966e-eb62-8848bd7b176a', 'c55e0dd5-8168-b109-0383-0c5ffa6b6aee', 'Loughborough International Scholarships Form', TRUE)
  ON CONFLICT (id) DO NOTHING;

  -- ──────────────────────────────────────────────────────────
  -- 5. SCHOLARSHIP ↔ UNIVERSITY LINKS
  -- ──────────────────────────────────────────────────────────
  INSERT INTO scholarship_universities (id, scholarship_id, university_id)
  VALUES
    ('bb05956f-2cf4-f292-f5be-ce682db6943a', '28d5d293-68cd-99ef-2719-8dab27240ddd', 'd4f33618-c8e1-34e9-09db-eb895f5d9f05'),
    ('0b98c04e-7bc2-52c3-3445-44b83a13d286', '28d5d293-68cd-99ef-2719-8dab27240ddd', '7aaa5c46-784f-558b-0550-1ec6e50f7473'),
    ('141db2ae-b31a-a73f-7aec-e2dab4d4e308', '28d5d293-68cd-99ef-2719-8dab27240ddd', 'e344a6a8-e958-c702-2c61-32ae7db55d11'),
    ('b2d45af0-4140-d0da-52c9-42176ab1edff', 'bb3801e7-14d8-9c23-3382-98cee27b215a', 'cf761589-cea2-ac87-e325-de96a9f23422'),
    ('590d5d39-5fad-e858-0fdf-f20deb511826', 'faf0520b-51d4-90b8-0340-744fb25ded7c', 'cf761589-cea2-ac87-e325-de96a9f23422'),
    ('52e7152c-2bd5-a227-1bb9-fc9e03b4be5f', '4128c014-1f2f-2556-118b-02017e824ce9', 'd4f33618-c8e1-34e9-09db-eb895f5d9f05'),
    ('c8f826c7-542c-70bb-3dc0-daaa41a24bbc', 'd8cf7925-16ee-0826-ee06-76ea8800cad5', '604087d8-0614-6c41-d92e-66a059422068'),
    ('4c4f02d8-2218-6277-0c74-02d2c93574cc', 'f989f356-f70e-dedb-5f6a-4d9272ea4906', '604087d8-0614-6c41-d92e-66a059422068'),
    ('6d20f580-8023-e227-61f3-a14873f609b9', 'b020dd3d-cec5-36d7-8be7-0803e35f92f8', '7aaa5c46-784f-558b-0550-1ec6e50f7473'),
    ('4079abc4-20b3-6f38-c4ee-9a51df6b30f3', 'da29cc2c-8399-ddb9-283e-9ef17c571bfb', 'd4f33618-c8e1-34e9-09db-eb895f5d9f05'),
    ('272c5160-4b76-ad2e-55ae-98562c26fa87', 'f91c2e62-4499-f5b5-5655-4dd4a65fe4dd', '7aaa5c46-784f-558b-0550-1ec6e50f7473'),
    ('0b16c4c0-958b-0813-1f23-4a4eac396a7b', 'c55e0dd5-8168-b109-0383-0c5ffa6b6aee', 'd4f33618-c8e1-34e9-09db-eb895f5d9f05')
  ON CONFLICT (scholarship_id, university_id) DO NOTHING;

END $$;

-- ── Verification queries ─────────────────────────────────────
SELECT 'universities' AS tbl, COUNT(*) FROM universities
UNION ALL SELECT 'checklist', COUNT(*) FROM checklist
UNION ALL SELECT 'scholarships', COUNT(*) FROM scholarships
UNION ALL SELECT 'scholarship_checklist', COUNT(*) FROM scholarship_checklist
UNION ALL SELECT 'scholarship_universities', COUNT(*) FROM scholarship_universities;