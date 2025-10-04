// Complete demo data for NCADbook system - Expanded production dataset

// ===== USERS (100 total) =====
export const demoUsers = [
  // Test accounts (4)
  { id: '1', email: 'master@ncad.ie', password: 'master123', first_name: 'Master', surname: 'Admin', full_name: 'Master Admin', role: 'master_admin', department: 'Administration', created_at: '2024-01-01' },
  { id: '2', email: 'admin@ncad.ie', password: 'admin123', first_name: 'Admin', surname: 'User', full_name: 'Admin User', role: 'department_admin', managed_department_id: 'sa5', department: 'Moving Image', created_at: '2024-01-01' },
  { id: '3', email: 'staff@ncad.ie', password: 'staff123', first_name: 'Staff', surname: 'Member', full_name: 'Staff Member', role: 'staff', department: 'Moving Image', managed_department_id: 'sa5', created_at: '2024-01-01', view_permissions: { can_view_catalog: true, can_create_bookings: true, can_cancel_bookings: true, can_view_history: true, can_view_analytics: false, can_export_data: false, can_request_access: true, email_notifications: true, modified_by: 'admin@ncad.ie', modified_at: '2024-01-15T10:00:00Z' } },
  { id: '4', email: 'demo@ncad.ie', password: 'demo123', first_name: 'Demo', surname: 'Student', full_name: 'Demo Student', role: 'student', department: 'Moving Image', created_at: '2024-01-01' },

  // Department Admins (7 total - one for each department)
  { id: '5', email: 'admin.gd@ncad.ie', password: 'admin123', first_name: 'Sarah', surname: 'Johnson', full_name: 'Sarah Johnson', role: 'department_admin', managed_department_id: 'sa7', department: 'Graphic Design', created_at: '2024-01-15' },
  { id: '101', email: 'admin.commdesign@ncad.ie', password: 'admin123', first_name: 'Patricia', surname: 'Moore', full_name: 'Patricia Moore', role: 'department_admin', managed_department_id: 'sa1', department: 'Communication Design', created_at: '2024-01-15' },
  { id: '102', email: 'admin.fineart@ncad.ie', password: 'admin123', first_name: 'Robert', surname: 'Clarke', full_name: 'Robert Clarke', role: 'department_admin', managed_department_id: 'sa2', department: 'Fine Art Media', created_at: '2024-01-15' },
  { id: '103', email: 'admin.sculpture@ncad.ie', password: 'admin123', first_name: 'Jennifer', surname: 'Taylor', full_name: 'Jennifer Taylor', role: 'department_admin', managed_department_id: 'sa3', department: 'Sculpture', created_at: '2024-01-15' },
  { id: '104', email: 'admin.illustration@ncad.ie', password: 'admin123', first_name: 'Thomas', surname: 'Anderson', full_name: 'Thomas Anderson', role: 'department_admin', managed_department_id: 'sa4', department: 'Illustration', created_at: '2024-01-15' },
  { id: '105', email: 'admin.photography@ncad.ie', password: 'admin123', first_name: 'Margaret', surname: 'Wilson', full_name: 'Margaret Wilson', role: 'department_admin', managed_department_id: 'sa6', department: 'Photography', created_at: '2024-01-15' },

  // Staff Members (5)
  { id: '6', email: 'staff.illustration@ncad.ie', password: 'staff123', first_name: 'Michael', surname: 'O\'Brien', full_name: 'Michael O\'Brien', role: 'staff', department: 'Illustration', managed_department_id: 'sa4', created_at: '2024-02-01', view_permissions: { can_view_catalog: true, can_create_bookings: true, can_cancel_bookings: false, can_view_history: true, can_view_analytics: true, can_export_data: true, can_request_access: true, email_notifications: true, modified_by: 'admin.illustration@ncad.ie', modified_at: '2024-02-05T14:30:00Z' } },
  { id: '7', email: 'staff.tech@ncad.ie', password: 'staff123', first_name: 'Emma', surname: 'Walsh', full_name: 'Emma Walsh', role: 'staff', department: 'Moving Image', managed_department_id: 'sa5', created_at: '2024-02-01', view_permissions: { can_view_catalog: true, can_create_bookings: true, can_cancel_bookings: true, can_view_history: true, can_view_analytics: false, can_export_data: false, can_request_access: false, email_notifications: false, modified_by: 'admin@ncad.ie', modified_at: '2024-02-10T09:15:00Z' } },
  { id: '8', email: 'staff.gd@ncad.ie', password: 'staff123', first_name: 'David', surname: 'Murphy', full_name: 'David Murphy', role: 'staff', department: 'Graphic Design', managed_department_id: 'sa7', created_at: '2024-02-15', view_permissions: { can_view_catalog: true, can_create_bookings: true, can_cancel_bookings: true, can_view_history: true, can_view_analytics: true, can_export_data: false, can_request_access: true, email_notifications: true, modified_by: 'admin.gd@ncad.ie', modified_at: '2024-02-20T11:45:00Z' } },
  { id: '9', email: 'staff.admin@ncad.ie', password: 'staff123', first_name: 'Lisa', surname: 'Kelly', full_name: 'Lisa Kelly', role: 'staff', department: 'Administration', managed_department_id: 'sa1', created_at: '2024-03-01', view_permissions: { can_view_catalog: false, can_create_bookings: false, can_cancel_bookings: false, can_view_history: false, can_view_analytics: false, can_export_data: false, can_request_access: false, email_notifications: true, modified_by: 'master@ncad.ie', modified_at: '2024-03-05T16:00:00Z' } },

  // Students - Moving Image Department (30)
  { id: '10', email: 'jane.smith@student.ncad.ie', password: 'student123', first_name: 'Jane', surname: 'Smith', full_name: 'Jane Smith', role: 'student', department: 'Moving Image', created_at: '2024-09-01' },
  { id: '11', email: 'john.doe@student.ncad.ie', password: 'student123', first_name: 'John', surname: 'Doe', full_name: 'John Doe', role: 'student', department: 'Moving Image', created_at: '2024-09-01' },
  { id: '12', email: 'chloe.ryan@student.ncad.ie', password: 'student123', first_name: 'Chloe', surname: 'Ryan', full_name: 'Chloe Ryan', role: 'student', department: 'Moving Image', created_at: '2024-09-01' },
  { id: '13', email: 'liam.byrne@student.ncad.ie', password: 'student123', first_name: 'Liam', surname: 'Byrne', full_name: 'Liam Byrne', role: 'student', department: 'Moving Image', created_at: '2024-09-01' },
  { id: '14', email: 'aoife.murphy@student.ncad.ie', password: 'student123', first_name: 'Aoife', surname: 'Murphy', full_name: 'Aoife Murphy', role: 'student', department: 'Moving Image', created_at: '2024-09-01' },
  { id: '15', email: 'sean.walsh@student.ncad.ie', password: 'student123', first_name: 'Sean', surname: 'Walsh', full_name: 'Sean Walsh', role: 'student', department: 'Moving Image', created_at: '2024-09-01' },
  { id: '16', email: 'emma.kelly@student.ncad.ie', password: 'student123', first_name: 'Emma', surname: 'Kelly', full_name: 'Emma Kelly', role: 'student', department: 'Moving Image', created_at: '2024-09-01' },
  { id: '17', email: 'jack.oleary@student.ncad.ie', password: 'student123', first_name: 'Jack', surname: 'O\'Leary', full_name: 'Jack O\'Leary', role: 'student', department: 'Moving Image', created_at: '2024-09-01' },
  { id: '18', email: 'sophie.brennan@student.ncad.ie', password: 'student123', first_name: 'Sophie', surname: 'Brennan', full_name: 'Sophie Brennan', role: 'student', department: 'Moving Image', created_at: '2024-09-01' },
  { id: '19', email: 'conor.sullivan@student.ncad.ie', password: 'student123', first_name: 'Conor', surname: 'Sullivan', full_name: 'Conor Sullivan', role: 'student', department: 'Moving Image', created_at: '2024-09-01' },
  { id: '20', email: 'grace.harris@student.ncad.ie', password: 'student123', first_name: 'Grace', surname: 'Harris', full_name: 'Grace Harris', role: 'student', department: 'Moving Image', created_at: '2024-09-02' },
  { id: '21', email: 'daniel.moore@student.ncad.ie', password: 'student123', first_name: 'Daniel', surname: 'Moore', full_name: 'Daniel Moore', role: 'student', department: 'Moving Image', created_at: '2024-09-02' },
  { id: '22', email: 'emily.clarke@student.ncad.ie', password: 'student123', first_name: 'Emily', surname: 'Clarke', full_name: 'Emily Clarke', role: 'student', department: 'Moving Image', created_at: '2024-09-02' },
  { id: '23', email: 'ryan.fitzgerald@student.ncad.ie', password: 'student123', first_name: 'Ryan', surname: 'Fitzgerald', full_name: 'Ryan Fitzgerald', role: 'student', department: 'Moving Image', created_at: '2024-09-02' },
  { id: '24', email: 'lucy.martin@student.ncad.ie', password: 'student123', first_name: 'Lucy', surname: 'Martin', full_name: 'Lucy Martin', role: 'student', department: 'Moving Image', created_at: '2024-09-02' },
  { id: '25', email: 'adam.quinn@student.ncad.ie', password: 'student123', first_name: 'Adam', surname: 'Quinn', full_name: 'Adam Quinn', role: 'student', department: 'Moving Image', created_at: '2024-09-02' },
  { id: '26', email: 'hannah.casey@student.ncad.ie', password: 'student123', first_name: 'Hannah', surname: 'Casey', full_name: 'Hannah Casey', role: 'student', department: 'Moving Image', created_at: '2024-09-02' },
  { id: '27', email: 'noah.lynch@student.ncad.ie', password: 'student123', first_name: 'Noah', surname: 'Lynch', full_name: 'Noah Lynch', role: 'student', department: 'Moving Image', created_at: '2024-09-02' },
  { id: '28', email: 'mia.donovan@student.ncad.ie', password: 'student123', first_name: 'Mia', surname: 'Donovan', full_name: 'Mia Donovan', role: 'student', department: 'Moving Image', created_at: '2024-09-03' },
  { id: '29', email: 'james.hughes@student.ncad.ie', password: 'student123', first_name: 'James', surname: 'Hughes', full_name: 'James Hughes', role: 'student', department: 'Moving Image', created_at: '2024-09-03' },
  { id: '30', email: 'ava.kennedy@student.ncad.ie', password: 'student123', first_name: 'Ava', surname: 'Kennedy', full_name: 'Ava Kennedy', role: 'student', department: 'Moving Image', created_at: '2024-09-03' },
  { id: '31', email: 'oliver.mccarthy@student.ncad.ie', password: 'student123', first_name: 'Oliver', surname: 'McCarthy', full_name: 'Oliver McCarthy', role: 'student', department: 'Moving Image', created_at: '2024-09-03' },
  { id: '32', email: 'ella.buckley@student.ncad.ie', password: 'student123', first_name: 'Ella', surname: 'Buckley', full_name: 'Ella Buckley', role: 'student', department: 'Moving Image', created_at: '2024-09-03' },
  { id: '33', email: 'finn.daly@student.ncad.ie', password: 'student123', first_name: 'Finn', surname: 'Daly', full_name: 'Finn Daly', role: 'student', department: 'Moving Image', created_at: '2024-09-03' },
  { id: '34', email: 'amelia.griffin@student.ncad.ie', password: 'student123', first_name: 'Amelia', surname: 'Griffin', full_name: 'Amelia Griffin', role: 'student', department: 'Moving Image', created_at: '2024-09-03' },
  { id: '35', email: 'lucas.power@student.ncad.ie', password: 'student123', first_name: 'Lucas', surname: 'Power', full_name: 'Lucas Power', role: 'student', department: 'Moving Image', created_at: '2024-09-04' },
  { id: '36', email: 'isla.gallagher@student.ncad.ie', password: 'student123', first_name: 'Isla', surname: 'Gallagher', full_name: 'Isla Gallagher', role: 'student', department: 'Moving Image', created_at: '2024-09-04' },
  { id: '37', email: 'charlie.dunne@student.ncad.ie', password: 'student123', first_name: 'Charlie', surname: 'Dunne', full_name: 'Charlie Dunne', role: 'student', department: 'Moving Image', created_at: '2024-09-04' },
  { id: '38', email: 'ruby.owens@student.ncad.ie', password: 'student123', first_name: 'Ruby', surname: 'Owens', full_name: 'Ruby Owens', role: 'student', department: 'Moving Image', created_at: '2024-09-04' },
  { id: '39', email: 'tom.collins@student.ncad.ie', password: 'student123', first_name: 'Tom', surname: 'Collins', full_name: 'Tom Collins', role: 'student', department: 'Moving Image', created_at: '2024-09-04' },

  // Students - Graphic Design Department (30)
  { id: '40', email: 'sarah.obrien@student.ncad.ie', password: 'student123', first_name: 'Sarah', surname: 'O\'Brien', full_name: 'Sarah O\'Brien', role: 'student', department: 'Graphic Design', created_at: '2024-09-01' },
  { id: '41', email: 'mark.williams@student.ncad.ie', password: 'student123', first_name: 'Mark', surname: 'Williams', full_name: 'Mark Williams', role: 'student', department: 'Graphic Design', created_at: '2024-09-01' },
  { id: '42', email: 'katie.jones@student.ncad.ie', password: 'student123', first_name: 'Katie', surname: 'Jones', full_name: 'Katie Jones', role: 'student', department: 'Graphic Design', created_at: '2024-09-01' },
  { id: '43', email: 'ben.brown@student.ncad.ie', password: 'student123', first_name: 'Ben', surname: 'Brown', full_name: 'Ben Brown', role: 'student', department: 'Graphic Design', created_at: '2024-09-01' },
  { id: '44', email: 'laura.davis@student.ncad.ie', password: 'student123', first_name: 'Laura', surname: 'Davis', full_name: 'Laura Davis', role: 'student', department: 'Graphic Design', created_at: '2024-09-01' },
  { id: '45', email: 'alex.white@student.ncad.ie', password: 'student123', first_name: 'Alex', surname: 'White', full_name: 'Alex White', role: 'student', department: 'Graphic Design', created_at: '2024-09-01' },
  { id: '46', email: 'rachel.taylor@student.ncad.ie', password: 'student123', first_name: 'Rachel', surname: 'Taylor', full_name: 'Rachel Taylor', role: 'student', department: 'Graphic Design', created_at: '2024-09-01' },
  { id: '47', email: 'luke.wilson@student.ncad.ie', password: 'student123', first_name: 'Luke', surname: 'Wilson', full_name: 'Luke Wilson', role: 'student', department: 'Graphic Design', created_at: '2024-09-01' },
  { id: '48', email: 'amy.thompson@student.ncad.ie', password: 'student123', first_name: 'Amy', surname: 'Thompson', full_name: 'Amy Thompson', role: 'student', department: 'Graphic Design', created_at: '2024-09-02' },
  { id: '49', email: 'rob.anderson@student.ncad.ie', password: 'student123', first_name: 'Rob', surname: 'Anderson', full_name: 'Rob Anderson', role: 'student', department: 'Graphic Design', created_at: '2024-09-02' },
  { id: '50', email: 'zoe.evans@student.ncad.ie', password: 'student123', first_name: 'Zoe', surname: 'Evans', full_name: 'Zoe Evans', role: 'student', department: 'Graphic Design', created_at: '2024-09-02' },
  { id: '51', email: 'max.roberts@student.ncad.ie', password: 'student123', first_name: 'Max', surname: 'Roberts', full_name: 'Max Roberts', role: 'student', department: 'Graphic Design', created_at: '2024-09-02' },
  { id: '52', email: 'holly.ward@student.ncad.ie', password: 'student123', first_name: 'Holly', surname: 'Ward', full_name: 'Holly Ward', role: 'student', department: 'Graphic Design', created_at: '2024-09-02' },
  { id: '53', email: 'josh.king@student.ncad.ie', password: 'student123', first_name: 'Josh', surname: 'King', full_name: 'Josh King', role: 'student', department: 'Graphic Design', created_at: '2024-09-02' },
  { id: '54', email: 'lily.price@student.ncad.ie', password: 'student123', first_name: 'Lily', surname: 'Price', full_name: 'Lily Price', role: 'student', department: 'Graphic Design', created_at: '2024-09-02' },
  { id: '55', email: 'sam.green@student.ncad.ie', password: 'student123', first_name: 'Sam', surname: 'Green', full_name: 'Sam Green', role: 'student', department: 'Graphic Design', created_at: '2024-09-03' },
  { id: '56', email: 'maya.bell@student.ncad.ie', password: 'student123', first_name: 'Maya', surname: 'Bell', full_name: 'Maya Bell', role: 'student', department: 'Graphic Design', created_at: '2024-09-03' },
  { id: '57', email: 'theo.scott@student.ncad.ie', password: 'student123', first_name: 'Theo', surname: 'Scott', full_name: 'Theo Scott', role: 'student', department: 'Graphic Design', created_at: '2024-09-03' },
  { id: '58', email: 'eva.young@student.ncad.ie', password: 'student123', first_name: 'Eva', surname: 'Young', full_name: 'Eva Young', role: 'student', department: 'Graphic Design', created_at: '2024-09-03' },
  { id: '59', email: 'ethan.hall@student.ncad.ie', password: 'student123', first_name: 'Ethan', surname: 'Hall', full_name: 'Ethan Hall', role: 'student', department: 'Graphic Design', created_at: '2024-09-03' },
  { id: '60', email: 'poppy.baker@student.ncad.ie', password: 'student123', first_name: 'Poppy', surname: 'Baker', full_name: 'Poppy Baker', role: 'student', department: 'Graphic Design', created_at: '2024-09-03' },
  { id: '61', email: 'leo.turner@student.ncad.ie', password: 'student123', first_name: 'Leo', surname: 'Turner', full_name: 'Leo Turner', role: 'student', department: 'Graphic Design', created_at: '2024-09-04' },
  { id: '62', email: 'freya.adams@student.ncad.ie', password: 'student123', first_name: 'Freya', surname: 'Adams', full_name: 'Freya Adams', role: 'student', department: 'Graphic Design', created_at: '2024-09-04' },
  { id: '63', email: 'harry.cooper@student.ncad.ie', password: 'student123', first_name: 'Harry', surname: 'Cooper', full_name: 'Harry Cooper', role: 'student', department: 'Graphic Design', created_at: '2024-09-04' },
  { id: '64', email: 'daisy.parker@student.ncad.ie', password: 'student123', first_name: 'Daisy', surname: 'Parker', full_name: 'Daisy Parker', role: 'student', department: 'Graphic Design', created_at: '2024-09-04' },
  { id: '65', email: 'jake.hughes@student.ncad.ie', password: 'student123', first_name: 'Jake', surname: 'Hughes', full_name: 'Jake Hughes', role: 'student', department: 'Graphic Design', created_at: '2024-09-04' },
  { id: '66', email: 'rosie.barnes@student.ncad.ie', password: 'student123', first_name: 'Rosie', surname: 'Barnes', full_name: 'Rosie Barnes', role: 'student', department: 'Graphic Design', created_at: '2024-09-04' },
  { id: '67', email: 'tyler.morgan@student.ncad.ie', password: 'student123', first_name: 'Tyler', surname: 'Morgan', full_name: 'Tyler Morgan', role: 'student', department: 'Graphic Design', created_at: '2024-09-05' },
  { id: '68', email: 'molly.reed@student.ncad.ie', password: 'student123', first_name: 'Molly', surname: 'Reed', full_name: 'Molly Reed', role: 'student', department: 'Graphic Design', created_at: '2024-09-05' },
  { id: '69', email: 'oscar.cox@student.ncad.ie', password: 'student123', first_name: 'Oscar', surname: 'Cox', full_name: 'Oscar Cox', role: 'student', department: 'Graphic Design', created_at: '2024-09-05' },

  // Students - Illustration Department (30)
  { id: '70', email: 'nina.foster@student.ncad.ie', password: 'student123', first_name: 'Nina', surname: 'Foster', full_name: 'Nina Foster', role: 'student', department: 'Illustration', created_at: '2024-09-01' },
  { id: '71', email: 'jamie.gray@student.ncad.ie', password: 'student123', first_name: 'Jamie', surname: 'Gray', full_name: 'Jamie Gray', role: 'student', department: 'Illustration', created_at: '2024-09-01' },
  { id: '72', email: 'alice.walsh@student.ncad.ie', password: 'student123', first_name: 'Alice', surname: 'Walsh', full_name: 'Alice Walsh', role: 'student', department: 'Illustration', created_at: '2024-09-01' },
  { id: '73', email: 'george.hayes@student.ncad.ie', password: 'student123', first_name: 'George', surname: 'Hayes', full_name: 'George Hayes', role: 'student', department: 'Illustration', created_at: '2024-09-01' },
  { id: '74', email: 'bella.hunt@student.ncad.ie', password: 'student123', first_name: 'Bella', surname: 'Hunt', full_name: 'Bella Hunt', role: 'student', department: 'Illustration', created_at: '2024-09-01' },
  { id: '75', email: 'nathan.stone@student.ncad.ie', password: 'student123', first_name: 'Nathan', surname: 'Stone', full_name: 'Nathan Stone', role: 'student', department: 'Illustration', created_at: '2024-09-01' },
  { id: '76', email: 'scarlett.webb@student.ncad.ie', password: 'student123', first_name: 'Scarlett', surname: 'Webb', full_name: 'Scarlett Webb', role: 'student', department: 'Illustration', created_at: '2024-09-01' },
  { id: '77', email: 'isaac.shaw@student.ncad.ie', password: 'student123', first_name: 'Isaac', surname: 'Shaw', full_name: 'Isaac Shaw', role: 'student', department: 'Illustration', created_at: '2024-09-02' },
  { id: '78', email: 'violet.mason@student.ncad.ie', password: 'student123', first_name: 'Violet', surname: 'Mason', full_name: 'Violet Mason', role: 'student', department: 'Illustration', created_at: '2024-09-02' },
  { id: '79', email: 'mason.lane@student.ncad.ie', password: 'student123', first_name: 'Mason', surname: 'Lane', full_name: 'Mason Lane', role: 'student', department: 'Illustration', created_at: '2024-09-02' },
  { id: '80', email: 'amber.knight@student.ncad.ie', password: 'student123', first_name: 'Amber', surname: 'Knight', full_name: 'Amber Knight', role: 'student', department: 'Illustration', created_at: '2024-09-02' },
  { id: '81', email: 'dylan.pearce@student.ncad.ie', password: 'student123', first_name: 'Dylan', surname: 'Pearce', full_name: 'Dylan Pearce', role: 'student', department: 'Illustration', created_at: '2024-09-02' },
  { id: '82', email: 'ivy.woods@student.ncad.ie', password: 'student123', first_name: 'Ivy', surname: 'Woods', full_name: 'Ivy Woods', role: 'student', department: 'Illustration', created_at: '2024-09-02' },
  { id: '83', email: 'jude.rose@student.ncad.ie', password: 'student123', first_name: 'Jude', surname: 'Rose', full_name: 'Jude Rose', role: 'student', department: 'Illustration', created_at: '2024-09-03' },
  { id: '84', email: 'willow.dean@student.ncad.ie', password: 'student123', first_name: 'Willow', surname: 'Dean', full_name: 'Willow Dean', role: 'student', department: 'Illustration', created_at: '2024-09-03' },
  { id: '85', email: 'kai.flynn@student.ncad.ie', password: 'student123', first_name: 'Kai', surname: 'Flynn', full_name: 'Kai Flynn', role: 'student', department: 'Illustration', created_at: '2024-09-03' },
  { id: '86', email: 'hazel.miles@student.ncad.ie', password: 'student123', first_name: 'Hazel', surname: 'Miles', full_name: 'Hazel Miles', role: 'student', department: 'Illustration', created_at: '2024-09-03' },
  { id: '87', email: 'blake.ford@student.ncad.ie', password: 'student123', first_name: 'Blake', surname: 'Ford', full_name: 'Blake Ford', role: 'student', department: 'Illustration', created_at: '2024-09-03' },
  { id: '88', email: 'aurora.grant@student.ncad.ie', password: 'student123', first_name: 'Aurora', surname: 'Grant', full_name: 'Aurora Grant', role: 'student', department: 'Illustration', created_at: '2024-09-03' },
  { id: '89', email: 'cooper.ellis@student.ncad.ie', password: 'student123', first_name: 'Cooper', surname: 'Ellis', full_name: 'Cooper Ellis', role: 'student', department: 'Illustration', created_at: '2024-09-04' },
  { id: '90', email: 'luna.hart@student.ncad.ie', password: 'student123', first_name: 'Luna', surname: 'Hart', full_name: 'Luna Hart', role: 'student', department: 'Illustration', created_at: '2024-09-04' },
  { id: '91', email: 'wyatt.crane@student.ncad.ie', password: 'student123', first_name: 'Wyatt', surname: 'Crane', full_name: 'Wyatt Crane', role: 'student', department: 'Illustration', created_at: '2024-09-04' },
  { id: '92', email: 'nova.fields@student.ncad.ie', password: 'student123', first_name: 'Nova', surname: 'Fields', full_name: 'Nova Fields', role: 'student', department: 'Illustration', created_at: '2024-09-04' },
  { id: '93', email: 'river.booth@student.ncad.ie', password: 'student123', first_name: 'River', surname: 'Booth', full_name: 'River Booth', role: 'student', department: 'Illustration', created_at: '2024-09-04' },
  { id: '94', email: 'sage.wells@student.ncad.ie', password: 'student123', first_name: 'Sage', surname: 'Wells', full_name: 'Sage Wells', role: 'student', department: 'Illustration', created_at: '2024-09-04' },
  { id: '95', email: 'asher.boyd@student.ncad.ie', password: 'student123', first_name: 'Asher', surname: 'Boyd', full_name: 'Asher Boyd', role: 'student', department: 'Illustration', created_at: '2024-09-05' },
  { id: '96', email: 'iris.palmer@student.ncad.ie', password: 'student123', first_name: 'Iris', surname: 'Palmer', full_name: 'Iris Palmer', role: 'student', department: 'Illustration', created_at: '2024-09-05' },
  { id: '97', email: 'rowan.nash@student.ncad.ie', password: 'student123', first_name: 'Rowan', surname: 'Nash', full_name: 'Rowan Nash', role: 'student', department: 'Illustration', created_at: '2024-09-05' },
  { id: '98', email: 'eden.cross@student.ncad.ie', password: 'student123', first_name: 'Eden', surname: 'Cross', full_name: 'Eden Cross', role: 'student', department: 'Illustration', created_at: '2024-09-05' },
  { id: '99', email: 'phoenix.reid@student.ncad.ie', password: 'student123', first_name: 'Phoenix', surname: 'Reid', full_name: 'Phoenix Reid', role: 'student', department: 'Illustration', created_at: '2024-09-05' },
  { id: '100', email: 'wren.blake@student.ncad.ie', password: 'student123', first_name: 'Wren', surname: 'Blake', full_name: 'Wren Blake', role: 'student', department: 'Illustration', created_at: '2024-09-05' },
];

// ===== EQUIPMENT (150+ items) =====
export const demoEquipment = [
  // Cameras - Moving Image (25)
  { id: 'eq1', product_name: 'Canon EOS R5', tracking_number: 'CAM-R5-001', category: 'Camera', description: 'Professional mirrorless camera with 8K video', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/canon-r5.jpg', requires_justification: true, sub_area_id: 'sa5' },
  { id: 'eq2', product_name: 'Canon EOS R5', tracking_number: 'CAM-R5-002', category: 'Camera', description: 'Professional mirrorless camera with 8K video', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/canon-r5.jpg', requires_justification: true, sub_area_id: 'sa5' },
  { id: 'eq3', product_name: 'Sony FX3', tracking_number: 'CAM-FX3-001', category: 'Camera', description: 'Cinema Line full-frame camera', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/sony-fx3.jpg', requires_justification: true, sub_area_id: 'sa5' },
  { id: 'eq4', product_name: 'Sony FX3', tracking_number: 'CAM-FX3-002', category: 'Camera', description: 'Cinema Line full-frame camera', department: 'Moving Image', status: 'booked', link_to_image: '/images/equipment/sony-fx3.jpg', requires_justification: true, sub_area_id: 'sa5' },
  { id: 'eq5', product_name: 'Sony A7S III', tracking_number: 'CAM-A7S3-001', category: 'Camera', description: 'Low-light video camera', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/sony-a7s3.jpg', requires_justification: true, sub_area_id: 'sa5' },
  { id: 'eq6', product_name: 'Sony A7S III', tracking_number: 'CAM-A7S3-002', category: 'Camera', description: 'Low-light video camera', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/sony-a7s3.jpg', requires_justification: true, sub_area_id: 'sa5' },
  { id: 'eq7', product_name: 'Blackmagic Pocket 6K', tracking_number: 'CAM-BM6K-001', category: 'Camera', description: 'Cinema camera with RAW recording', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/blackmagic.jpg', requires_justification: true, sub_area_id: 'sa5' },
  { id: 'eq8', product_name: 'Blackmagic Pocket 6K', tracking_number: 'CAM-BM6K-002', category: 'Camera', description: 'Cinema camera with RAW recording', department: 'Moving Image', status: 'maintenance', link_to_image: '/images/equipment/blackmagic.jpg', requires_justification: true, sub_area_id: 'sa5' },
  { id: 'eq9', product_name: 'Canon C70', tracking_number: 'CAM-C70-001', category: 'Camera', description: 'Professional cinema camera', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/canon-c70.jpg', requires_justification: true, sub_area_id: 'sa5' },
  { id: 'eq10', product_name: 'Panasonic GH6', tracking_number: 'CAM-GH6-001', category: 'Camera', description: 'Hybrid camera for photo/video', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/panasonic-gh6.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq11', product_name: 'Panasonic GH6', tracking_number: 'CAM-GH6-002', category: 'Camera', description: 'Hybrid camera for photo/video', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/panasonic-gh6.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq12', product_name: 'Panasonic GH6', tracking_number: 'CAM-GH6-003', category: 'Camera', description: 'Hybrid camera for photo/video', department: 'Moving Image', status: 'booked', link_to_image: '/images/equipment/panasonic-gh6.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq13', product_name: 'Canon EOS R6', tracking_number: 'CAM-R6-001', category: 'Camera', description: 'Versatile full-frame mirrorless', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/canon-r6.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq14', product_name: 'Canon EOS R6', tracking_number: 'CAM-R6-002', category: 'Camera', description: 'Versatile full-frame mirrorless', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/canon-r6.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq15', product_name: 'Canon EOS R6', tracking_number: 'CAM-R6-003', category: 'Camera', description: 'Versatile full-frame mirrorless', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/canon-r6.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq16', product_name: 'Sony ZV-E10', tracking_number: 'CAM-ZVE10-001', category: 'Camera', description: 'Compact vlogging camera', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/sony-zv.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq17', product_name: 'Sony ZV-E10', tracking_number: 'CAM-ZVE10-002', category: 'Camera', description: 'Compact vlogging camera', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/sony-zv.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq18', product_name: 'DJI Pocket 3', tracking_number: 'CAM-DJI-001', category: 'Camera', description: 'Handheld gimbal camera', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/dji-pocket.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq19', product_name: 'DJI Pocket 3', tracking_number: 'CAM-DJI-002', category: 'Camera', description: 'Handheld gimbal camera', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/dji-pocket.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq20', product_name: 'GoPro Hero 12', tracking_number: 'CAM-GP12-001', category: 'Camera', description: 'Action camera', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/gopro.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq21', product_name: 'GoPro Hero 12', tracking_number: 'CAM-GP12-002', category: 'Camera', description: 'Action camera', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/gopro.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq22', product_name: 'GoPro Hero 12', tracking_number: 'CAM-GP12-003', category: 'Camera', description: 'Action camera', department: 'Moving Image', status: 'booked', link_to_image: '/images/equipment/gopro.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq23', product_name: 'Insta360 X3', tracking_number: 'CAM-360-001', category: 'Camera', description: '360-degree action camera', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/insta360.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq24', product_name: 'Insta360 X3', tracking_number: 'CAM-360-002', category: 'Camera', description: '360-degree action camera', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/insta360.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq25', product_name: 'DJI Mavic 3 Pro', tracking_number: 'CAM-DRONE-001', category: 'Camera', description: 'Professional drone with Hasselblad camera', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/drone.jpg', requires_justification: true, sub_area_id: 'sa5' },

  // Lenses - Moving Image (20)
  { id: 'eq26', product_name: 'Canon RF 24-70mm f/2.8', tracking_number: 'LENS-RF2470-001', category: 'Lens', description: 'Professional zoom lens', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq27', product_name: 'Canon RF 24-70mm f/2.8', tracking_number: 'LENS-RF2470-002', category: 'Lens', description: 'Professional zoom lens', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq28', product_name: 'Canon RF 70-200mm f/2.8', tracking_number: 'LENS-RF70200-001', category: 'Lens', description: 'Telephoto zoom lens', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq29', product_name: 'Canon RF 15-35mm f/2.8', tracking_number: 'LENS-RF1535-001', category: 'Lens', description: 'Wide-angle zoom lens', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq30', product_name: 'Canon RF 50mm f/1.2', tracking_number: 'LENS-RF50-001', category: 'Lens', description: 'Fast prime lens', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq31', product_name: 'Canon RF 50mm f/1.2', tracking_number: 'LENS-RF50-002', category: 'Lens', description: 'Fast prime lens', department: 'Moving Image', status: 'booked', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq32', product_name: 'Sony FE 24-70mm f/2.8 GM', tracking_number: 'LENS-FE2470-001', category: 'Lens', description: 'G Master standard zoom', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq33', product_name: 'Sony FE 24-70mm f/2.8 GM', tracking_number: 'LENS-FE2470-002', category: 'Lens', description: 'G Master standard zoom', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq34', product_name: 'Sony FE 70-200mm f/2.8 GM', tracking_number: 'LENS-FE70200-001', category: 'Lens', description: 'G Master telephoto zoom', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq35', product_name: 'Sony FE 16-35mm f/2.8 GM', tracking_number: 'LENS-FE1635-001', category: 'Lens', description: 'G Master wide-angle zoom', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq36', product_name: 'Sony FE 50mm f/1.2 GM', tracking_number: 'LENS-FE50-001', category: 'Lens', description: 'G Master fast prime', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq37', product_name: 'Sony FE 85mm f/1.4 GM', tracking_number: 'LENS-FE85-001', category: 'Lens', description: 'G Master portrait lens', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq38', product_name: 'Sigma 18-35mm f/1.8', tracking_number: 'LENS-SIG1835-001', category: 'Lens', description: 'Fast zoom for APS-C', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq39', product_name: 'Sigma 18-35mm f/1.8', tracking_number: 'LENS-SIG1835-002', category: 'Lens', description: 'Fast zoom for APS-C', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq40', product_name: 'Laowa 24mm f/14 Probe', tracking_number: 'LENS-PROBE-001', category: 'Lens', description: 'Macro probe lens', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq41', product_name: 'Canon EF 100mm f/2.8 Macro', tracking_number: 'LENS-EF100-001', category: 'Lens', description: 'Macro lens', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq42', product_name: 'Samyang 14mm f/2.8', tracking_number: 'LENS-SAM14-001', category: 'Lens', description: 'Ultra wide-angle lens', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq43', product_name: 'Samyang 14mm f/2.8', tracking_number: 'LENS-SAM14-002', category: 'Lens', description: 'Ultra wide-angle lens', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq44', product_name: 'Tokina 11-16mm f/2.8', tracking_number: 'LENS-TOK11-001', category: 'Lens', description: 'Ultra wide zoom', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq45', product_name: 'Canon EF 24-105mm f/4', tracking_number: 'LENS-EF24105-001', category: 'Lens', description: 'Versatile zoom lens', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa5' },

  // Lighting - Moving Image (25)
  { id: 'eq46', product_name: 'Aputure 300d II', tracking_number: 'LIGHT-AP300-001', category: 'Lighting', description: 'LED light 300W', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq47', product_name: 'Aputure 300d II', tracking_number: 'LIGHT-AP300-002', category: 'Lighting', description: 'LED light 300W', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq48', product_name: 'Aputure 300d II', tracking_number: 'LIGHT-AP300-003', category: 'Lighting', description: 'LED light 300W', department: 'Moving Image', status: 'booked', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq49', product_name: 'Aputure 600d Pro', tracking_number: 'LIGHT-AP600-001', category: 'Lighting', description: 'LED light 600W', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: true, sub_area_id: 'sa5' },
  { id: 'eq50', product_name: 'Aputure 120d II', tracking_number: 'LIGHT-AP120-001', category: 'Lighting', description: 'LED light 120W', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq51', product_name: 'Aputure 120d II', tracking_number: 'LIGHT-AP120-002', category: 'Lighting', description: 'LED light 120W', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq52', product_name: 'Aputure 120d II', tracking_number: 'LIGHT-AP120-003', category: 'Lighting', description: 'LED light 120W', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq53', product_name: 'Aputure MC Pro', tracking_number: 'LIGHT-APMC-001', category: 'Lighting', description: 'RGB LED panel light', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq54', product_name: 'Aputure MC Pro', tracking_number: 'LIGHT-APMC-002', category: 'Lighting', description: 'RGB LED panel light', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq55', product_name: 'Aputure MC Pro', tracking_number: 'LIGHT-APMC-003', category: 'Lighting', description: 'RGB LED panel light', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq56', product_name: 'Godox SL-60W', tracking_number: 'LIGHT-GD60-001', category: 'Lighting', description: 'LED video light 60W', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq57', product_name: 'Godox SL-60W', tracking_number: 'LIGHT-GD60-002', category: 'Lighting', description: 'LED video light 60W', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq58', product_name: 'Godox SL-60W', tracking_number: 'LIGHT-GD60-003', category: 'Lighting', description: 'LED video light 60W', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq59', product_name: 'Nanlite PavoTube II 30X', tracking_number: 'LIGHT-PAVO-001', category: 'Lighting', description: 'RGB tube light', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq60', product_name: 'Nanlite PavoTube II 30X', tracking_number: 'LIGHT-PAVO-002', category: 'Lighting', description: 'RGB tube light', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq61', product_name: 'Nanlite PavoTube II 30X', tracking_number: 'LIGHT-PAVO-003', category: 'Lighting', description: 'RGB tube light', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq62', product_name: 'Arri 650W Fresnel', tracking_number: 'LIGHT-ARRI650-001', category: 'Lighting', description: 'Tungsten fresnel light', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq63', product_name: 'Arri 650W Fresnel', tracking_number: 'LIGHT-ARRI650-002', category: 'Lighting', description: 'Tungsten fresnel light', department: 'Moving Image', status: 'maintenance', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq64', product_name: 'Kino Flo Diva-Lite 401', tracking_number: 'LIGHT-KF401-001', category: 'Lighting', description: 'Fluorescent panel light', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq65', product_name: 'Kino Flo Diva-Lite 401', tracking_number: 'LIGHT-KF401-002', category: 'Lighting', description: 'Fluorescent panel light', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq66', product_name: 'Profoto B10 Plus', tracking_number: 'LIGHT-PRO-001', category: 'Lighting', description: 'Battery-powered strobe', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq67', product_name: 'Profoto B10 Plus', tracking_number: 'LIGHT-PRO-002', category: 'Lighting', description: 'Battery-powered strobe', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq68', product_name: 'Light Panel Kit (3x)', tracking_number: 'LIGHT-KIT-001', category: 'Lighting', description: '3-light interview kit', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq69', product_name: 'Light Panel Kit (3x)', tracking_number: 'LIGHT-KIT-002', category: 'Lighting', description: '3-light interview kit', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq70', product_name: 'C-Stand Set (5x)', tracking_number: 'LIGHT-STAND-001', category: 'Lighting', description: 'Heavy-duty light stands', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/stand.jpg', requires_justification: false, sub_area_id: 'sa5' },

  // Audio - Moving Image (15)
  { id: 'eq71', product_name: 'Sennheiser MKH 416', tracking_number: 'AUD-MKH416-001', category: 'Audio', description: 'Shotgun microphone', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/mic.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq72', product_name: 'Sennheiser MKH 416', tracking_number: 'AUD-MKH416-002', category: 'Audio', description: 'Shotgun microphone', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/mic.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq73', product_name: 'Rode NTG5', tracking_number: 'AUD-NTG5-001', category: 'Audio', description: 'Lightweight shotgun mic', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/mic.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq74', product_name: 'Rode NTG5', tracking_number: 'AUD-NTG5-002', category: 'Audio', description: 'Lightweight shotgun mic', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/mic.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq75', product_name: 'Rode Wireless Go II', tracking_number: 'AUD-WGII-001', category: 'Audio', description: 'Wireless lavalier system', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/wireless-mic.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq76', product_name: 'Rode Wireless Go II', tracking_number: 'AUD-WGII-002', category: 'Audio', description: 'Wireless lavalier system', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/wireless-mic.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq77', product_name: 'Rode Wireless Go II', tracking_number: 'AUD-WGII-003', category: 'Audio', description: 'Wireless lavalier system', department: 'Moving Image', status: 'booked', link_to_image: '/images/equipment/wireless-mic.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq78', product_name: 'Zoom H6', tracking_number: 'AUD-H6-001', category: 'Audio', description: '6-track portable recorder', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/recorder.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq79', product_name: 'Zoom H6', tracking_number: 'AUD-H6-002', category: 'Audio', description: '6-track portable recorder', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/recorder.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq80', product_name: 'Zoom H5', tracking_number: 'AUD-H5-001', category: 'Audio', description: '4-track portable recorder', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/recorder.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq81', product_name: 'Zoom H5', tracking_number: 'AUD-H5-002', category: 'Audio', description: '4-track portable recorder', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/recorder.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq82', product_name: 'Sound Devices MixPre-6 II', tracking_number: 'AUD-MIXPRE-001', category: 'Audio', description: 'Professional field mixer', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/mixer.jpg', requires_justification: true, sub_area_id: 'sa5' },
  { id: 'eq83', product_name: 'Boom Pole Kit', tracking_number: 'AUD-BOOM-001', category: 'Audio', description: 'Boom pole with accessories', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/boom.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq84', product_name: 'Boom Pole Kit', tracking_number: 'AUD-BOOM-002', category: 'Audio', description: 'Boom pole with accessories', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/boom.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq85', product_name: 'Deity V-Mic D4 Duo', tracking_number: 'AUD-VMD4-001', category: 'Audio', description: 'Dual-capsule shotgun mic', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/mic.jpg', requires_justification: false, sub_area_id: 'sa5' },

  // Support/Grip - Moving Image (15)
  { id: 'eq86', product_name: 'DJI Ronin RS 3', tracking_number: 'SUP-RS3-001', category: 'Support', description: 'Camera gimbal stabilizer', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/gimbal.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq87', product_name: 'DJI Ronin RS 3', tracking_number: 'SUP-RS3-002', category: 'Support', description: 'Camera gimbal stabilizer', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/gimbal.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq88', product_name: 'DJI Ronin RS 3 Pro', tracking_number: 'SUP-RS3PRO-001', category: 'Support', description: 'Pro gimbal for heavy cameras', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/gimbal.jpg', requires_justification: true, sub_area_id: 'sa5' },
  { id: 'eq89', product_name: 'Zhiyun Crane 3S', tracking_number: 'SUP-ZY3S-001', category: 'Support', description: 'Heavy-duty gimbal', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/gimbal.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq90', product_name: 'Sachtler Video 18', tracking_number: 'SUP-SAC18-001', category: 'Support', description: 'Professional tripod system', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/tripod.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq91', product_name: 'Sachtler Video 18', tracking_number: 'SUP-SAC18-002', category: 'Support', description: 'Professional tripod system', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/tripod.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq92', product_name: 'Manfrotto 546B', tracking_number: 'SUP-MAN546-001', category: 'Support', description: 'Video tripod with fluid head', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/tripod.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq93', product_name: 'Manfrotto 546B', tracking_number: 'SUP-MAN546-002', category: 'Support', description: 'Video tripod with fluid head', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/tripod.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq94', product_name: 'Manfrotto 546B', tracking_number: 'SUP-MAN546-003', category: 'Support', description: 'Video tripod with fluid head', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/tripod.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq95', product_name: 'Camera Slider 100cm', tracking_number: 'SUP-SLIDE-001', category: 'Support', description: 'Motorized camera slider', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/slider.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq96', product_name: 'Camera Slider 100cm', tracking_number: 'SUP-SLIDE-002', category: 'Support', description: 'Motorized camera slider', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/slider.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq97', product_name: 'Shoulder Rig Kit', tracking_number: 'SUP-SRIG-001', category: 'Support', description: 'Camera shoulder mount system', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/shoulder-rig.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq98', product_name: 'Shoulder Rig Kit', tracking_number: 'SUP-SRIG-002', category: 'Support', description: 'Camera shoulder mount system', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/shoulder-rig.jpg', requires_justification: false, sub_area_id: 'sa5' },
  { id: 'eq99', product_name: 'Track Dolly System', tracking_number: 'SUP-DOLLY-001', category: 'Support', description: '3m track with dolly', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/dolly.jpg', requires_justification: true, sub_area_id: 'sa5' },
  { id: 'eq100', product_name: 'Steadicam Merlin 2', tracking_number: 'SUP-STEAD-001', category: 'Support', description: 'Handheld stabilizer', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/steadicam.jpg', requires_justification: false, sub_area_id: 'sa5' },

  // Computers - Graphic Design (20)
  { id: 'eq101', product_name: 'MacBook Pro 16" M3 Max', tracking_number: 'LAP-MBP-001', category: 'Computer', description: '64GB RAM, 2TB SSD', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/macbook.jpg', requires_justification: true, sub_area_id: 'sa7' },
  { id: 'eq102', product_name: 'MacBook Pro 16" M3 Max', tracking_number: 'LAP-MBP-002', category: 'Computer', description: '64GB RAM, 2TB SSD', department: 'Graphic Design', status: 'booked', link_to_image: '/images/equipment/macbook.jpg', requires_justification: true, sub_area_id: 'sa7' },
  { id: 'eq103', product_name: 'MacBook Pro 16" M2 Pro', tracking_number: 'LAP-MBP-003', category: 'Computer', description: '32GB RAM, 1TB SSD', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/macbook.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq104', product_name: 'MacBook Pro 16" M2 Pro', tracking_number: 'LAP-MBP-004', category: 'Computer', description: '32GB RAM, 1TB SSD', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/macbook.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq105', product_name: 'MacBook Pro 14" M2 Pro', tracking_number: 'LAP-MBP14-001', category: 'Computer', description: '16GB RAM, 512GB SSD', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/macbook.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq106', product_name: 'MacBook Pro 14" M2 Pro', tracking_number: 'LAP-MBP14-002', category: 'Computer', description: '16GB RAM, 512GB SSD', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/macbook.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq107', product_name: 'MacBook Pro 14" M2 Pro', tracking_number: 'LAP-MBP14-003', category: 'Computer', description: '16GB RAM, 512GB SSD', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/macbook.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq108', product_name: 'iPad Pro 12.9" M2', tracking_number: 'TAB-IPP-001', category: 'Computer', description: 'With Apple Pencil & Magic Keyboard', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/ipad.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq109', product_name: 'iPad Pro 12.9" M2', tracking_number: 'TAB-IPP-002', category: 'Computer', description: 'With Apple Pencil & Magic Keyboard', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/ipad.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq110', product_name: 'iPad Pro 12.9" M2', tracking_number: 'TAB-IPP-003', category: 'Computer', description: 'With Apple Pencil & Magic Keyboard', department: 'Graphic Design', status: 'booked', link_to_image: '/images/equipment/ipad.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq111', product_name: 'Wacom Cintiq Pro 24', tracking_number: 'TAB-WAC24-001', category: 'Computer', description: '4K pen display', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/wacom.jpg', requires_justification: true, sub_area_id: 'sa7' },
  { id: 'eq112', product_name: 'Wacom Cintiq Pro 24', tracking_number: 'TAB-WAC24-002', category: 'Computer', description: '4K pen display', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/wacom.jpg', requires_justification: true, sub_area_id: 'sa7' },
  { id: 'eq113', product_name: 'Wacom Intuos Pro L', tracking_number: 'TAB-WACINL-001', category: 'Computer', description: 'Large graphics tablet', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/wacom.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq114', product_name: 'Wacom Intuos Pro L', tracking_number: 'TAB-WACINL-002', category: 'Computer', description: 'Large graphics tablet', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/wacom.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq115', product_name: 'Wacom Intuos Pro L', tracking_number: 'TAB-WACINL-003', category: 'Computer', description: 'Large graphics tablet', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/wacom.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq116', product_name: 'XP-Pen Artist 24 Pro', tracking_number: 'TAB-XP24-001', category: 'Computer', description: 'Pen display tablet', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/xppen.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq117', product_name: 'XP-Pen Artist 24 Pro', tracking_number: 'TAB-XP24-002', category: 'Computer', description: 'Pen display tablet', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/xppen.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq118', product_name: 'Dell XPS 15', tracking_number: 'LAP-DELL-001', category: 'Computer', description: '32GB RAM, RTX 4060, 1TB SSD', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/dell.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq119', product_name: 'Dell XPS 15', tracking_number: 'LAP-DELL-002', category: 'Computer', description: '32GB RAM, RTX 4060, 1TB SSD', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/dell.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq120', product_name: 'LG 27" 4K Monitor', tracking_number: 'MON-LG27-001', category: 'Computer', description: 'Color-calibrated display', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/monitor.jpg', requires_justification: false, sub_area_id: 'sa7' },

  // Cameras - Graphic Design (10)
  { id: 'eq121', product_name: 'Canon EOS R5', tracking_number: 'CAM-R5-003', category: 'Camera', description: 'High-resolution photography', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/canon-r5.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq122', product_name: 'Canon EOS R6 II', tracking_number: 'CAM-R6II-001', category: 'Camera', description: 'All-purpose camera', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/canon-r6.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq123', product_name: 'Canon EOS R6 II', tracking_number: 'CAM-R6II-002', category: 'Camera', description: 'All-purpose camera', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/canon-r6.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq124', product_name: 'Sony A7R V', tracking_number: 'CAM-A7RV-001', category: 'Camera', description: '61MP high-resolution camera', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/sony-a7r.jpg', requires_justification: true, sub_area_id: 'sa7' },
  { id: 'eq125', product_name: 'Fujifilm X-T5', tracking_number: 'CAM-XTF-001', category: 'Camera', description: 'APS-C mirrorless camera', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/fuji.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq126', product_name: 'Fujifilm X-T5', tracking_number: 'CAM-XTF-002', category: 'Camera', description: 'APS-C mirrorless camera', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/fuji.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq127', product_name: 'Canon RF 100mm f/2.8 Macro', tracking_number: 'LENS-RF100M-001', category: 'Lens', description: 'Macro lens for product photography', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq128', product_name: 'Canon EF 24-70mm f/2.8 II', tracking_number: 'LENS-EF2470-001', category: 'Lens', description: 'Standard zoom lens', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/lens.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq129', product_name: 'Godox AD200 Pro', tracking_number: 'LIGHT-GD200-001', category: 'Lighting', description: 'Portable flash strobe', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/flash.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq130', product_name: 'Godox AD200 Pro', tracking_number: 'LIGHT-GD200-002', category: 'Lighting', description: 'Portable flash strobe', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/flash.jpg', requires_justification: false, sub_area_id: 'sa7' },

  // Printers/Scanners - Graphic Design (10)
  { id: 'eq131', product_name: 'Epson SureColor P800', tracking_number: 'PRINT-EP800-001', category: 'Printer', description: 'A2 professional photo printer', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/printer.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq132', product_name: 'Canon imagePROGRAF PRO-300', tracking_number: 'PRINT-CAN300-001', category: 'Printer', description: 'A3+ photo printer', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/printer.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq133', product_name: 'HP DesignJet T650', tracking_number: 'PRINT-HP650-001', category: 'Printer', description: 'Large format plotter 36"', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/plotter.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq134', product_name: 'Epson FastFoto FF-680W', tracking_number: 'SCAN-FF680-001', category: 'Scanner', description: 'High-speed photo scanner', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/scanner.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq135', product_name: 'Canon CanoScan 9000F', tracking_number: 'SCAN-CS9000-001', category: 'Scanner', description: 'Flatbed scanner with film scanning', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/scanner.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq136', product_name: 'Cricut Maker 3', tracking_number: 'CUT-CRIC-001', category: 'Cutter', description: 'Cutting machine for vinyl/paper/fabric', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/cricut.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq137', product_name: 'Cricut Maker 3', tracking_number: 'CUT-CRIC-002', category: 'Cutter', description: 'Cutting machine for vinyl/paper/fabric', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/cricut.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq138', product_name: 'Brother ScanNCut SDX230D', tracking_number: 'CUT-BRO-001', category: 'Cutter', description: 'Scanning and cutting machine', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/cutter.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq139', product_name: 'Pantone Color Bridge Guide', tracking_number: 'COL-PAN-001', category: 'Tool', description: 'Color matching system', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/pantone.jpg', requires_justification: false, sub_area_id: 'sa7' },
  { id: 'eq140', product_name: 'X-Rite i1Display Pro', tracking_number: 'COL-XRI-001', category: 'Tool', description: 'Monitor calibration tool', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/calibrator.jpg', requires_justification: false, sub_area_id: 'sa7' },

  // Illustration Equipment (10)
  { id: 'eq141', product_name: 'iPad Pro 12.9" M2', tracking_number: 'TAB-IPP-004', category: 'Computer', description: 'With Apple Pencil Pro', department: 'Illustration', status: 'available', link_to_image: '/images/equipment/ipad.jpg', requires_justification: false, sub_area_id: 'sa4' },
  { id: 'eq142', product_name: 'iPad Pro 12.9" M2', tracking_number: 'TAB-IPP-005', category: 'Computer', description: 'With Apple Pencil Pro', department: 'Illustration', status: 'available', link_to_image: '/images/equipment/ipad.jpg', requires_justification: false, sub_area_id: 'sa4' },
  { id: 'eq143', product_name: 'Wacom Cintiq Pro 16', tracking_number: 'TAB-WAC16-001', category: 'Computer', description: 'Portable pen display', department: 'Illustration', status: 'available', link_to_image: '/images/equipment/wacom.jpg', requires_justification: false, sub_area_id: 'sa4' },
  { id: 'eq144', product_name: 'Wacom Cintiq Pro 16', tracking_number: 'TAB-WAC16-002', category: 'Computer', description: 'Portable pen display', department: 'Illustration', status: 'available', link_to_image: '/images/equipment/wacom.jpg', requires_justification: false, sub_area_id: 'sa4' },
  { id: 'eq145', product_name: 'Wacom Intuos Pro M', tracking_number: 'TAB-WACINM-001', category: 'Computer', description: 'Medium graphics tablet', department: 'Illustration', status: 'available', link_to_image: '/images/equipment/wacom.jpg', requires_justification: false, sub_area_id: 'sa4' },
  { id: 'eq146', product_name: 'Wacom Intuos Pro M', tracking_number: 'TAB-WACINM-002', category: 'Computer', description: 'Medium graphics tablet', department: 'Illustration', status: 'available', link_to_image: '/images/equipment/wacom.jpg', requires_justification: false, sub_area_id: 'sa4' },
  { id: 'eq147', product_name: 'MacBook Air M2', tracking_number: 'LAP-MBA-001', category: 'Computer', description: '16GB RAM, 512GB SSD', department: 'Illustration', status: 'available', link_to_image: '/images/equipment/macbook-air.jpg', requires_justification: false, sub_area_id: 'sa4' },
  { id: 'eq148', product_name: 'MacBook Air M2', tracking_number: 'LAP-MBA-002', category: 'Computer', description: '16GB RAM, 512GB SSD', department: 'Illustration', status: 'available', link_to_image: '/images/equipment/macbook-air.jpg', requires_justification: false, sub_area_id: 'sa4' },
  { id: 'eq149', product_name: 'Lightbox A3', tracking_number: 'TOOL-LB-001', category: 'Tool', description: 'LED tracing lightbox', department: 'Illustration', status: 'available', link_to_image: '/images/equipment/lightbox.jpg', requires_justification: false, sub_area_id: 'sa4' },
  { id: 'eq150', product_name: 'Epson Expression 12000XL', tracking_number: 'SCAN-EP12K-001', category: 'Scanner', description: 'A3 flatbed scanner for artwork', department: 'Illustration', status: 'available', link_to_image: '/images/equipment/scanner.jpg', requires_justification: false, sub_area_id: 'sa4' },
];

// ===== SPACES (15 rooms/studios) =====
export const demoSpaces = [
  // Moving Image Studios (6)
  { id: 'sp1', name: 'Studio A - Main Film Studio', capacity: 20, description: 'Large film studio with 5m ceiling, green screen wall, and professional lighting grid', department: 'Moving Image', equipment_available: 'Green screen (6m x 4m), lighting grid, C-stands, sandbags', status: 'available', hourly_booking: true },
  { id: 'sp2', name: 'Studio B - Photography Studio', capacity: 8, description: 'Medium studio with white cyclorama and product photography setup', department: 'Moving Image', equipment_available: 'White cyclorama, product table, backdrop support', status: 'available', hourly_booking: true },
  { id: 'sp3', name: 'Edit Suite 1', capacity: 4, description: 'Professional editing room with Mac Studio and dual 4K monitors', department: 'Moving Image', equipment_available: 'Mac Studio (M2 Ultra), 2x LG 32" 4K monitors, DaVinci Resolve, Adobe CC', status: 'available', hourly_booking: true },
  { id: 'sp4', name: 'Edit Suite 2', capacity: 4, description: 'Editing room with color grading setup', department: 'Moving Image', equipment_available: 'Mac Studio (M2 Max), calibrated monitor, Blackmagic panel', status: 'available', hourly_booking: true },
  { id: 'sp5', name: 'Sound Recording Booth', capacity: 3, description: 'Acoustically treated recording space', department: 'Moving Image', equipment_available: 'Rode NT1, audio interface, boom arm, acoustic treatment', status: 'available', hourly_booking: true },
  { id: 'sp6', name: 'Animation Lab', capacity: 12, description: 'Stop-motion and digital animation workspace', department: 'Moving Image', equipment_available: 'Stop-motion rigs, lighting, animation software', status: 'available', hourly_booking: true },

  // Graphic Design Rooms (5)
  { id: 'sp7', name: 'Design Lab 1', capacity: 16, description: 'Computer lab with iMac workstations', department: 'Graphic Design', equipment_available: '16x iMac 27" (M3), Adobe CC, Figma, Sketch', status: 'available', hourly_booking: true },
  { id: 'sp8', name: 'Design Lab 2', capacity: 16, description: 'Computer lab with PC workstations', department: 'Graphic Design', equipment_available: '16x Dell workstations, Adobe CC, Rhino, AutoCAD', status: 'available', hourly_booking: true },
  { id: 'sp9', name: 'Print Workshop', capacity: 8, description: 'Screen printing and risograph studio', department: 'Graphic Design', equipment_available: 'Risograph, screen printing stations, drying racks', status: 'available', hourly_booking: true },
  { id: 'sp10', name: 'Photography Studio GD', capacity: 6, description: 'Product photography studio for graphic design students', department: 'Graphic Design', equipment_available: 'Backdrop system, strobes, shooting table', status: 'available', hourly_booking: true },
  { id: 'sp11', name: 'Critique Room', capacity: 20, description: 'Presentation space with projector and pin-up walls', department: 'Graphic Design', equipment_available: '4K projector, pin boards, presentation podium', status: 'available', hourly_booking: true },

  // Illustration Rooms (4)
  { id: 'sp12', name: 'Illustration Studio 1', capacity: 18, description: 'Traditional illustration workspace with natural light', department: 'Illustration', equipment_available: 'Drawing tables, easels, natural north-facing light', status: 'available', hourly_booking: true },
  { id: 'sp13', name: 'Illustration Studio 2', capacity: 18, description: 'Mixed media workspace', department: 'Illustration', equipment_available: 'Drawing tables, sink, storage cabinets', status: 'available', hourly_booking: true },
  { id: 'sp14', name: 'Digital Illustration Lab', capacity: 12, description: 'Computer lab with Cintiq displays', department: 'Illustration', equipment_available: '12x Wacom Cintiq 22, Adobe CC, Procreate on iPad', status: 'available', hourly_booking: true },
  { id: 'sp15', name: 'Life Drawing Studio', capacity: 20, description: 'Large studio for life drawing sessions', department: 'Illustration', equipment_available: 'Easels, model platform, adjustable lighting', status: 'available', hourly_booking: true },
];

// ===== BOOKINGS (25 realistic bookings) =====
export const demoBookings = [
  // Pending bookings
  { id: 'bk1', user_id: '4', equipment_id: 'eq1', start_date: '2025-10-05', end_date: '2025-10-08', status: 'pending', purpose: 'Final year film project - documentary shoot', created_at: '2025-10-01T10:00:00Z' },
  { id: 'bk2', user_id: '10', equipment_id: 'eq3', start_date: '2025-10-06', end_date: '2025-10-09', status: 'pending', purpose: 'Narrative short film - location filming', created_at: '2025-10-01T11:30:00Z' },
  { id: 'bk3', user_id: '15', equipment_id: 'eq49', start_date: '2025-10-07', end_date: '2025-10-10', status: 'pending', purpose: 'Music video production - studio setup', created_at: '2025-10-01T14:00:00Z' },
  { id: 'bk4', user_id: '20', equipment_id: 'eq88', start_date: '2025-10-08', end_date: '2025-10-11', status: 'pending', purpose: 'Commercial project requiring smooth camera movement', created_at: '2025-10-01T15:45:00Z' },
  { id: 'bk5', user_id: '25', equipment_id: 'eq101', start_date: '2025-10-09', end_date: '2025-10-12', status: 'pending', purpose: 'Video editing for thesis project', created_at: '2025-10-01T16:20:00Z' },

  // Approved bookings
  { id: 'bk6', user_id: '12', equipment_id: 'eq4', start_date: '2025-10-03', end_date: '2025-10-06', status: 'approved', purpose: 'Interview series for documentary', created_at: '2025-09-28T09:00:00Z', approved_by: '2', approved_at: '2025-09-29T10:00:00Z' },
  { id: 'bk7', user_id: '18', equipment_id: 'eq12', start_date: '2025-10-04', end_date: '2025-10-07', status: 'approved', purpose: 'Event coverage - college open day', created_at: '2025-09-29T11:00:00Z', approved_by: '2', approved_at: '2025-09-30T14:00:00Z' },
  { id: 'bk8', user_id: '22', equipment_id: 'eq22', start_date: '2025-10-02', end_date: '2025-10-05', status: 'approved', purpose: 'Action shots for skateboarding documentary', created_at: '2025-09-27T13:00:00Z', approved_by: '2', approved_at: '2025-09-28T09:00:00Z' },
  { id: 'bk9', user_id: '30', equipment_id: 'eq31', start_date: '2025-10-05', end_date: '2025-10-08', status: 'approved', purpose: 'Portrait project using shallow depth of field', created_at: '2025-09-30T10:00:00Z', approved_by: '2', approved_at: '2025-10-01T09:00:00Z' },
  { id: 'bk10', user_id: '35', equipment_id: 'eq48', start_date: '2025-10-06', end_date: '2025-10-09', status: 'approved', purpose: 'Studio lighting for product photography', created_at: '2025-10-01T08:00:00Z', approved_by: '2', approved_at: '2025-10-01T10:30:00Z' },
  { id: 'bk11', user_id: '40', equipment_id: 'eq77', start_date: '2025-10-04', end_date: '2025-10-07', status: 'approved', purpose: 'Podcast recording series', created_at: '2025-09-29T15:00:00Z', approved_by: '5', approved_at: '2025-09-30T11:00:00Z' },
  { id: 'bk12', user_id: '45', equipment_id: 'eq102', start_date: '2025-10-03', end_date: '2025-10-10', status: 'approved', purpose: 'Motion graphics project for client brief', created_at: '2025-09-28T12:00:00Z', approved_by: '5', approved_at: '2025-09-29T09:00:00Z' },
  { id: 'bk13', user_id: '50', equipment_id: 'eq110', start_date: '2025-10-05', end_date: '2025-10-08', status: 'approved', purpose: 'Digital illustration for exhibition', created_at: '2025-09-30T14:00:00Z', approved_by: '5', approved_at: '2025-10-01T08:00:00Z' },

  // Completed bookings
  { id: 'bk14', user_id: '14', equipment_id: 'eq5', start_date: '2025-09-20', end_date: '2025-09-23', status: 'completed', purpose: 'Short film production', created_at: '2025-09-15T10:00:00Z', approved_by: '2', approved_at: '2025-09-16T09:00:00Z', returned_at: '2025-09-23T15:00:00Z' },
  { id: 'bk15', user_id: '19', equipment_id: 'eq10', start_date: '2025-09-18', end_date: '2025-09-21', status: 'completed', purpose: 'Wedding videography practice', created_at: '2025-09-13T11:00:00Z', approved_by: '2', approved_at: '2025-09-14T10:00:00Z', returned_at: '2025-09-21T14:00:00Z' },
  { id: 'bk16', user_id: '26', equipment_id: 'eq50', start_date: '2025-09-15', end_date: '2025-09-18', status: 'completed', purpose: 'Studio portrait lighting', created_at: '2025-09-10T09:00:00Z', approved_by: '2', approved_at: '2025-09-11T08:00:00Z', returned_at: '2025-09-18T16:00:00Z' },
  { id: 'bk17', user_id: '32', equipment_id: 'eq75', start_date: '2025-09-22', end_date: '2025-09-25', status: 'completed', purpose: 'Interview audio recording', created_at: '2025-09-17T12:00:00Z', approved_by: '2', approved_at: '2025-09-18T09:00:00Z', returned_at: '2025-09-25T11:00:00Z' },
  { id: 'bk18', user_id: '42', equipment_id: 'eq103', start_date: '2025-09-19', end_date: '2025-09-26', status: 'completed', purpose: 'Graphic design portfolio work', created_at: '2025-09-14T10:00:00Z', approved_by: '5', approved_at: '2025-09-15T09:00:00Z', returned_at: '2025-09-26T15:00:00Z' },

  // Denied bookings
  { id: 'bk19', user_id: '16', equipment_id: 'eq1', start_date: '2025-10-10', end_date: '2025-10-20', status: 'denied', purpose: 'Personal project', created_at: '2025-09-25T10:00:00Z', approved_by: '2', approved_at: '2025-09-26T09:00:00Z', denial_reason: 'Booking period too long. Maximum 7 days for high-value equipment.' },
  { id: 'bk20', user_id: '28', equipment_id: 'eq49', start_date: '2025-10-12', end_date: '2025-10-15', status: 'denied', purpose: 'Testing', created_at: '2025-09-27T11:00:00Z', approved_by: '2', approved_at: '2025-09-28T10:00:00Z', denial_reason: 'Insufficient justification for professional lighting equipment. Please provide project details.' },

  // Overdue bookings
  { id: 'bk21', user_id: '24', equipment_id: 'eq20', start_date: '2025-09-25', end_date: '2025-09-28', status: 'overdue', purpose: 'Action camera for sports filming', created_at: '2025-09-20T10:00:00Z', approved_by: '2', approved_at: '2025-09-21T09:00:00Z' },

  // Cancelled bookings
  { id: 'bk22', user_id: '38', equipment_id: 'eq86', start_date: '2025-10-01', end_date: '2025-10-04', status: 'cancelled', purpose: 'Gimbal test for project', created_at: '2025-09-26T12:00:00Z', approved_by: '2', approved_at: '2025-09-27T10:00:00Z', cancelled_at: '2025-09-30T14:00:00Z' },

  // Additional pending from other departments
  { id: 'bk23', user_id: '70', equipment_id: 'eq141', start_date: '2025-10-06', end_date: '2025-10-09', status: 'pending', purpose: 'Digital painting for illustrated book project', created_at: '2025-10-01T12:00:00Z' },
  { id: 'bk24', user_id: '75', equipment_id: 'eq143', start_date: '2025-10-07', end_date: '2025-10-10', status: 'pending', purpose: 'Character design illustrations', created_at: '2025-10-01T13:30:00Z' },
  { id: 'bk25', user_id: '55', equipment_id: 'eq124', start_date: '2025-10-08', end_date: '2025-10-11', status: 'pending', purpose: 'High-resolution product photography for portfolio', created_at: '2025-10-01T14:45:00Z' },
];

// ===== SPACE BOOKINGS (10 room bookings) =====
export const demoSpaceBookings = [
  { id: 'sb1', user_id: '3', space_id: 'sp1', booking_date: '2025-10-02', start_time: '09:00', end_time: '13:00', status: 'approved', purpose: 'Green screen filming for student project', created_at: '2025-09-28T10:00:00Z' },
  { id: 'sb2', user_id: '3', space_id: 'sp3', booking_date: '2025-10-03', start_time: '14:00', end_time: '18:00', status: 'approved', purpose: 'Video editing session', created_at: '2025-09-29T11:00:00Z' },
  { id: 'sb3', user_id: '7', space_id: 'sp6', booking_date: '2025-10-04', start_time: '10:00', end_time: '16:00', status: 'approved', purpose: 'Stop-motion animation workshop', created_at: '2025-09-30T09:00:00Z' },
  { id: 'sb4', user_id: '8', space_id: 'sp7', booking_date: '2025-10-05', start_time: '09:00', end_time: '12:00', status: 'approved', purpose: 'Design critique session with students', created_at: '2025-10-01T08:00:00Z' },
  { id: 'sb5', user_id: '6', space_id: 'sp12', booking_date: '2025-10-05', start_time: '13:00', end_time: '17:00', status: 'approved', purpose: 'Traditional illustration workshop', created_at: '2025-10-01T09:00:00Z' },
  { id: 'sb6', user_id: '12', space_id: 'sp2', booking_date: '2025-10-06', start_time: '10:00', end_time: '14:00', status: 'pending', purpose: 'Product photography shoot', created_at: '2025-10-01T10:00:00Z' },
  { id: 'sb7', user_id: '41', space_id: 'sp10', booking_date: '2025-10-06', start_time: '14:00', end_time: '18:00', status: 'pending', purpose: 'Portfolio photography session', created_at: '2025-10-01T11:00:00Z' },
  { id: 'sb8', user_id: '72', space_id: 'sp15', booking_date: '2025-10-07', start_time: '09:00', end_time: '13:00', status: 'pending', purpose: 'Life drawing practice', created_at: '2025-10-01T12:00:00Z' },
  { id: 'sb9', user_id: '18', space_id: 'sp5', booking_date: '2025-10-07', start_time: '15:00', end_time: '17:00', status: 'pending', purpose: 'Voiceover recording for film', created_at: '2025-10-01T13:00:00Z' },
  { id: 'sb10', user_id: '52', space_id: 'sp9', booking_date: '2025-10-08', start_time: '10:00', end_time: '16:00', status: 'pending', purpose: 'Screen printing posters', created_at: '2025-10-01T14:00:00Z' },
];

// ===== FEATURE FLAGS =====
export const demoFeatureFlags = [
  { id: 'ff1', name: 'room_booking', enabled: true, description: 'Enable room/space booking for staff', required_role: 'staff' },
  { id: 'ff2', name: 'analytics_export', enabled: true, description: 'Enable analytics export (CSV/PDF)', required_role: 'admin' },
  { id: 'ff3', name: 'equipment_notes', enabled: true, description: 'Enable equipment maintenance notes', required_role: 'admin' },
  { id: 'ff4', name: 'csv_import', enabled: false, description: 'Enable CSV import for users/equipment', required_role: 'master_admin' },
  { id: 'ff5', name: 'email_notifications', enabled: false, description: 'Enable email notifications via EmailJS', required_role: 'admin' },
];

// ===== EQUIPMENT NOTES (15 maintenance/damage notes) =====
export const demoEquipmentNotes = [
  { id: 'en1', equipment_id: 'eq8', note_type: 'maintenance', note: 'Sensor cleaning required. Minor dust spots visible.', created_by: '2', created_at: '2025-09-15T10:00:00Z' },
  { id: 'en2', equipment_id: 'eq8', note_type: 'maintenance', note: 'Sent for sensor cleaning. Expected back 2025-09-25.', created_by: '2', created_at: '2025-09-16T09:00:00Z' },
  { id: 'en3', equipment_id: 'eq63', note_type: 'damage', note: 'Barn doors bent. Needs replacement.', created_by: '2', created_at: '2025-09-20T14:00:00Z' },
  { id: 'en4', equipment_id: 'eq63', note_type: 'maintenance', note: 'Bulb nearing end of life (800+ hours). Replace soon.', created_by: '2', created_at: '2025-09-20T14:05:00Z' },
  { id: 'en5', equipment_id: 'eq4', note_type: 'usage', note: 'Recently returned. Battery health at 85%. Monitor performance.', created_by: '2', created_at: '2025-09-28T11:00:00Z' },
  { id: 'en6', equipment_id: 'eq20', note_type: 'damage', note: 'Minor scratches on lens housing. Functional not affected.', created_by: '2', created_at: '2025-09-22T15:00:00Z' },
  { id: 'en7', equipment_id: 'eq1', note_type: 'maintenance', note: 'Firmware updated to v1.8.1', created_by: '2', created_at: '2025-09-10T09:00:00Z' },
  { id: 'en8', equipment_id: 'eq1', note_type: 'general', note: 'Popular item. Consider purchasing additional unit.', created_by: '1', created_at: '2025-09-25T10:00:00Z' },
  { id: 'en9', equipment_id: 'eq101', note_type: 'usage', note: 'Battery cycle count: 45. Excellent condition.', created_by: '5', created_at: '2025-09-18T12:00:00Z' },
  { id: 'en10', equipment_id: 'eq102', note_type: 'usage', note: 'Battery cycle count: 120. Normal wear.', created_by: '5', created_at: '2025-09-18T12:05:00Z' },
  { id: 'en11', equipment_id: 'eq111', note_type: 'maintenance', note: 'Pen tip replaced. Calibration verified.', created_by: '5', created_at: '2025-09-12T14:00:00Z' },
  { id: 'en12', equipment_id: 'eq49', note_type: 'general', note: 'High-demand item. Book early.', created_by: '2', created_at: '2025-09-05T10:00:00Z' },
  { id: 'en13', equipment_id: 'eq82', note_type: 'usage', note: 'Audio levels calibrated. Ready for field use.', created_by: '2', created_at: '2025-09-08T11:00:00Z' },
  { id: 'en14', equipment_id: 'eq99', note_type: 'maintenance', note: 'Tracks cleaned and lubricated. Dolly wheels inspected.', created_by: '2', created_at: '2025-09-01T15:00:00Z' },
  { id: 'en15', equipment_id: 'eq131', note_type: 'maintenance', note: 'Print head cleaning performed. Test prints successful.', created_by: '5', created_at: '2025-09-14T10:00:00Z' },
];

// ===== SUB-AREAS =====
export const demoSubAreas = [
  { id: 'sa1', name: 'Communication Design', description: 'Visual communication and graphic design', parent_department: 'School of Design', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'sa2', name: 'Fine Art Media', description: 'Contemporary fine art practices and media', parent_department: 'School of Fine Art', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'sa3', name: 'Sculpture & Expanded Practice', description: 'Three-dimensional art and installation', parent_department: 'School of Fine Art', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'sa4', name: 'Illustration', description: 'Visual storytelling and illustration', parent_department: 'School of Design', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'sa5', name: 'Moving Image Design', description: 'Film, animation, and motion graphics', parent_department: 'School of Design', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'sa6', name: 'Photography', description: 'Contemporary photography practice', parent_department: 'School of Design', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'sa7', name: 'Graphic Design', description: 'Typography, branding, and digital design', parent_department: 'School of Design', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
];

// ===== USER SUB-AREA ASSIGNMENTS =====
// ===== USER SUB-AREA ASSIGNMENTS =====
// ===== USER SUB-AREA ASSIGNMENTS =====
export const demoUserSubAreas = [
  // Moving Image students and staff (31 users: student id=4, students id=10-39, staff id=3,7)
  { id: 'usa1', user_id: '4', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa2', user_id: '10', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa3', user_id: '11', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa4', user_id: '12', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa5', user_id: '13', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa6', user_id: '14', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa7', user_id: '15', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa8', user_id: '16', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa9', user_id: '17', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa10', user_id: '18', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa11', user_id: '19', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa12', user_id: '20', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa13', user_id: '21', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa14', user_id: '22', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa15', user_id: '23', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa16', user_id: '24', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa17', user_id: '25', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa18', user_id: '26', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa19', user_id: '27', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa20', user_id: '28', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa21', user_id: '29', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa22', user_id: '30', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa23', user_id: '31', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa24', user_id: '32', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa25', user_id: '33', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa26', user_id: '34', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa27', user_id: '35', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa28', user_id: '36', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa29', user_id: '37', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa30', user_id: '38', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa31', user_id: '39', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },

  // Graphic Design students and staff (31 users: students id=40-69, staff id=8)
  { id: 'usa32', user_id: '40', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa33', user_id: '41', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa34', user_id: '42', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa35', user_id: '43', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa36', user_id: '44', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa37', user_id: '45', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa38', user_id: '46', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa39', user_id: '47', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa40', user_id: '48', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa41', user_id: '49', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa42', user_id: '50', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa43', user_id: '51', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa44', user_id: '52', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa45', user_id: '53', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa46', user_id: '54', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa47', user_id: '55', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa48', user_id: '56', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa49', user_id: '57', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa50', user_id: '58', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa51', user_id: '59', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa52', user_id: '60', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa53', user_id: '61', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa54', user_id: '62', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa55', user_id: '63', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa56', user_id: '64', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa57', user_id: '65', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa58', user_id: '66', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa59', user_id: '67', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa60', user_id: '68', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa61', user_id: '69', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa62', user_id: '70', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },

  // Illustration students and staff (32 users: students id=70-100, staff id=6)
  { id: 'usa63', user_id: '71', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa64', user_id: '72', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa65', user_id: '73', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa66', user_id: '74', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa67', user_id: '75', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa68', user_id: '76', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa69', user_id: '77', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa70', user_id: '78', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa71', user_id: '79', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa72', user_id: '80', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa73', user_id: '81', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa74', user_id: '82', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa75', user_id: '83', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa76', user_id: '84', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa77', user_id: '85', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa78', user_id: '86', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa79', user_id: '87', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa80', user_id: '88', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa81', user_id: '89', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa82', user_id: '90', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa83', user_id: '91', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa84', user_id: '92', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa85', user_id: '93', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa86', user_id: '94', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa87', user_id: '95', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa88', user_id: '96', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa89', user_id: '97', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa90', user_id: '98', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa91', user_id: '99', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa92', user_id: '100', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa93', user_id: '3', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa94', user_id: '7', sub_area_id: 'sa5', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa95', user_id: '8', sub_area_id: 'sa7', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' },
  { id: 'usa96', user_id: '6', sub_area_id: 'sa4', assigned_at: '2024-09-01T00:00:00Z', assigned_by: '1' }
];





// ===== INTERDISCIPLINARY ACCESS GRANTS =====
export const demoInterdisciplinaryAccess = [
  // Moving Image students can access Photography equipment
  { id: 'ida1', from_sub_area_id: 'sa5', to_sub_area_id: 'sa6', granted_by: '1', granted_at: '2024-09-01T00:00:00Z', expires_at: null, is_active: true, notes: 'For collaborative film/photo projects' },

  // Illustration students can access Graphic Design equipment
  { id: 'ida2', from_sub_area_id: 'sa4', to_sub_area_id: 'sa7', granted_by: '1', granted_at: '2024-09-01T00:00:00Z', expires_at: null, is_active: true, notes: 'For digital illustration workflows' },

  // Fine Art Media students can access Moving Image equipment (temporary - expires in 3 months)
  { id: 'ida3', from_sub_area_id: 'sa2', to_sub_area_id: 'sa5', granted_by: '1', granted_at: '2024-09-01T00:00:00Z', expires_at: '2024-12-01T00:00:00Z', is_active: true, notes: 'Semester 1 video art project' },

  // Communication Design can access all design sub-areas (broad access)
  { id: 'ida4', from_sub_area_id: 'sa1', to_sub_area_id: 'sa7', granted_by: '1', granted_at: '2024-09-01T00:00:00Z', expires_at: null, is_active: true, notes: 'Interdisciplinary design projects' },
  { id: 'ida5', from_sub_area_id: 'sa1', to_sub_area_id: 'sa4', granted_by: '1', granted_at: '2024-09-01T00:00:00Z', expires_at: null, is_active: true, notes: 'Illustration for communication design' },
];
// ===== ACCESS REQUESTS =====
// Requests from sub-area admins to access other sub-areas' equipment
export const demoAccessRequests = [
  // Pending request from Moving Image admin to access Photography equipment
  {
    id: 'ar1',
    requesting_admin_id: '2',  // admin@ncad.ie (Moving Image sub-area admin)
    from_sub_area_id: 'sa5',   // Moving Image
    to_sub_area_id: 'sa6',     // Photography
    status: 'pending',
    reason: 'Our students need access to DSLR cameras for film photography projects in Semester 2',
    requested_at: '2025-09-25T10:00:00Z',
    reviewed_by: null,
    reviewed_at: null,
    notes: null
  },

  // Approved request from Illustration admin to access Graphic Design equipment
  {
    id: 'ar2',
    requesting_admin_id: '104', // admin.illustration@ncad.ie
    from_sub_area_id: 'sa4',    // Illustration
    to_sub_area_id: 'sa7',      // Graphic Design
    status: 'approved',
    reason: 'Students need access to digital design tools for illustration workflows',
    requested_at: '2025-09-15T09:30:00Z',
    reviewed_by: '1',           // master admin
    reviewed_at: '2025-09-16T14:20:00Z',
    notes: 'Approved - interdisciplinary access grant created (ida2)'
  },

  // Denied request from Graphic Design admin to access Fine Art equipment
  {
    id: 'ar3',
    requesting_admin_id: '5',   // admin.gd@ncad.ie
    from_sub_area_id: 'sa7',    // Graphic Design
    to_sub_area_id: 'sa2',      // Fine Art Media
    status: 'denied',
    reason: 'Students want to experiment with fine art media for experimental design projects',
    requested_at: '2025-09-10T11:00:00Z',
    reviewed_by: '1',
    reviewed_at: '2025-09-12T10:15:00Z',
    notes: 'Denied - Fine Art equipment is limited and prioritized for Fine Art students. Please submit specific project proposals for case-by-case approval.'
  },

  // Pending request from Sculpture admin to access Moving Image equipment
  {
    id: 'ar4',
    requesting_admin_id: '103', // admin.sculpture@ncad.ie
    from_sub_area_id: 'sa3',    // Sculpture
    to_sub_area_id: 'sa5',      // Moving Image
    status: 'pending',
    reason: 'Need video equipment to document sculpture installations and create time-lapse videos',
    requested_at: '2025-09-28T14:45:00Z',
    reviewed_by: null,
    reviewed_at: null,
    notes: null
  },

  // Approved request from Communication Design admin to access Illustration equipment
  {
    id: 'ar5',
    requesting_admin_id: '101', // admin.commdesign@ncad.ie
    from_sub_area_id: 'sa1',    // Communication Design
    to_sub_area_id: 'sa4',      // Illustration
    status: 'approved',
    reason: 'Communication Design students need illustration tablets for visual communication projects',
    requested_at: '2025-09-01T08:00:00Z',
    reviewed_by: '1',
    reviewed_at: '2025-09-02T09:00:00Z',
    notes: 'Approved - interdisciplinary access grant created (ida5)'
  },

  // Pending request from Photography admin to access Moving Image lighting
  {
    id: 'ar6',
    requesting_admin_id: '105', // admin.photography@ncad.ie
    from_sub_area_id: 'sa6',    // Photography
    to_sub_area_id: 'sa5',      // Moving Image
    status: 'pending',
    reason: 'Need access to LED lighting equipment for studio photography sessions',
    requested_at: '2025-09-30T13:20:00Z',
    reviewed_by: null,
    reviewed_at: null,
    notes: null
  }
];

