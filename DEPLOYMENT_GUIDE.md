# How to Access Your App from ANY Network (Cloud Deployment)

Since you want the app to work on **any network** (e.g., 4G, office Wi-Fi, friend's house) without using tunnels, the only professional solution is to **host your backend on the cloud**.

This makes your server accessible via a public URL like `https://payment-app.onrender.com` instead of a local IP like `192.168.1.5`.

## Step 1: Move Database to Cloud (MongoDB Atlas) - Free
Your local database won't work with a cloud server. You need a cloud database.

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up (Free).
2.  Create a **Cluster** (select the Free tier).
3.  In **Database Access**, create a database user (e.g., `admin` / `password123`).
4.  In **Network Access**, add IP Address `0.0.0.0/0` (Allow Access from Anywhere).
5.  Click **Connect** -> **Drivers** -> Copy the connection string (e.g., `mongodb+srv://admin:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`).

## Step 2: Deploy Backend to Render - Free
Render is a free cloud hosting service for Node.js.

1.  Go to [Render.com](https://render.com/) and sign up.
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository (`payment-management`).
4.  Settings:
    -   **Name:** `payment-backend` (or similar)
    -   **Root Directory:** `backend` (Important! Your code is in the backend folder)
    -   **Environment:** `Node`
    -   **Build Command:** `npm install`
    -   **Start Command:** `node index.js`
5.  **Environment Variables** (Advanced):
    -   Key: `MONGO_URI`
    -   Value: Paste your MongoDB Atlas connection string (replace `<password>` with real password).
    -   Key: `JWT_SECRET`
    -   Value: `your_secret_key_here`
6.  Click **Create Web Service**.
7.  Wait for deployment. You will get a URL like `https://payment-backend.onrender.com`.

## Step 3: Update Mobile App
Once you have the Render URL:

1.  Open `mobile/src/api/axiosConfig.js`.
2.  Update the `CLOUD_API_URL` variable at the top:
    ```javascript
    const CLOUD_API_URL = 'https://payment-backend.onrender.com/api';
    ```
3.  Save and reload your mobile app.

**Now your app will work on ANY network (4G, Wi-Fi, etc.)!**
