# Step-by-Step Guide: Host Your Backend on Render (Free)

This guide will help you put your backend online so your mobile app works on **ANY network** (4G, Wi-Fi, etc.).

Since your app uses a database (MongoDB), you need two things:
1.  **A Cloud Database** (MongoDB Atlas) - To store your data online.
2.  **A Cloud Server** (Render) - To run your backend code online.

---

## Part 1: Set Up the Cloud Database (MongoDB Atlas)
Your local database on your computer cannot be accessed by the cloud server. We need to move it to the cloud.

1.  **Create an Account:**
    -   Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up for free.

2.  **Create a Cluster:**
    -   Click **Build a Database**.
    -   Select **M0 FREE**.
    -   Choose a provider (AWS) and region (closest to you, e.g., N. Virginia or Mumbai).
    -   Click **Create Deployment**.

3.  **Create a Database User:**
    -   **Username:** `admin` (or anything you like).
    -   **Password:** Create a strong password (e.g., `MySecurePassword123`). **Write this down!**
    -   Click **Create Database User**.

4.  **Allow Network Access:**
    -   Go to **Network Access** in the left menu.
    -   Click **Add IP Address**.
    -   Select **Allow Access from Anywhere** (`0.0.0.0/0`).
    -   Click **Confirm**.

5.  **Get Connection String:**
    -   Go to **Database** in the left menu.
    -   Click **Connect**.
    -   Select **Drivers**.
    -   Copy the connection string. It looks like:
        `mongodb+srv://admin:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
    -   **Replace `<password>`** with the password you created in Step 3.

---

## Part 2: Deploy Backend to Render
Now we will put your Node.js backend code on Render.

1.  **Create an Account:**
    -   Go to [Render.com](https://render.com/) and sign up with your GitHub account.

2.  **Create a Web Service:**
    -   Click the **New +** button and select **Web Service**.
    -   Connect your GitHub repository: `payment-management`.

3.  **Configure the Service:**
    -   **Name:** `payment-backend` (or any unique name).
    -   **Region:** Select the one closest to you.
    -   **Branch:** `main`
    -   **Root Directory:** `backend` (Important! Your server code is in this folder).
    -   **Runtime:** `Node`
    -   **Build Command:** `npm install`
    -   **Start Command:** `node index.js`
    -   **Instance Type:** Free

4.  **Add Environment Variables:**
    -   Scroll down to **Environment Variables**.
    -   Click **Add Environment Variable**.
    -   Add the following keys and values:

    | Key | Value |
    | :--- | :--- |
    | `MONGO_URI` | Paste your MongoDB connection string from Part 1 (with the password replaced). |
    | `JWT_SECRET` | `your_secret_key_here` (or any random string for security). |
    | `PORT` | `10000` (Render sets this automatically, but good to know). |

5.  **Deploy:**
    -   Click **Create Web Service**.
    -   Wait for the deployment to finish. It might take a few minutes.
    -   Once done, you will see a URL at the top left, like: `https://payment-backend.onrender.com`.

---

## Part 3: Update Mobile App
Now that your backend is online, tell your mobile app to use it.

1.  Copy your new Render URL (e.g., `https://payment-backend.onrender.com`).
2.  Open `mobile/src/api/axiosConfig.js` in your code editor.
3.  Paste the URL into the `CLOUD_API_URL` variable:
    ```javascript
    const CLOUD_API_URL = 'https://payment-backend.onrender.com/api'; 
    // Make sure to add /api at the end if your routes start with /api
    ```
    *Note: Check your `index.js` to see if you use `/api`. In your case, you do (`app.use('/api/auth', ...)`).*

4.  Save the file.
5.  Restart your mobile app (`npx expo start`).

**Done! Now your app works on any network.**
