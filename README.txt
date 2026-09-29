A-CURSORS — SETUP
=================

Firebase project already connected:
  Project ID: a-cursors

1. FIREBASE AUTHENTICATION
--------------------------
Firebase Console -> Authentication -> Sign-in method -> Email/Password -> Enable.

Then create your admin user under Authentication -> Users.

2. CREATE THE ADMIN DOCUMENT
-----------------------------
Copy the UID of the admin user from Authentication -> Users.

Firestore Database -> Data -> create:

admins
  <ADMIN_UID>
    role: admin

The document ID MUST exactly match the Firebase Authentication UID.

3. FIRESTORE RULES
------------------
Publish the rules from firestore.rules in:
Firestore Database -> Rules.

Public visitors can read cursor records.
Only an authenticated user whose /admins/<UID> document has role="admin"
can create, edit, or delete cursor records.

4. RUN THE SITE
---------------
Use VS Code + Live Server (recommended), or any normal web server.
Do not open the HTML files directly with file:// because browser module and
Firebase behavior can be restricted from local files.

5. ADMIN
--------
Open login.html and sign in using the Firebase Authentication admin account.
After authorization, the site sends you to admin.html.

6. ADD A CURSOR
---------------
The admin form supports:
- Name
- Category
- Creator
- Version
- Size
- External download URL
- Main preview image URL
- Description
- Search keywords
- Gallery image URLs
- Installation instructions

Every saved cursor receives its own Firestore document ID. Clicking its
homepage card opens cursor.html?id=<DOCUMENT_ID>, which loads that cursor's
complete content dynamically.

7. SEARCH
---------
The homepage searches name, category, creator, description, version, size,
and every keyword added in the admin panel.

8. LOGO
-------
Keep logo.png in the project root. It is used by the navbar, footer, login,
admin panel, and favicon.

9. SECURITY NOTE
----------------
The Firebase Web config is intentionally included in the frontend. This is
normal for Firebase web apps. Security comes from Authentication and
Firestore Security Rules, not from hiding the web config.


IMPORTANT: Run this project through VS Code Live Server or another HTTP server. Do NOT open index.html directly as file:// because Firebase ES modules/auth may not work correctly from file://.
