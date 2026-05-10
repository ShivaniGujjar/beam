# Step 1: Base image select karein (Node.js version 20 or 22)
FROM node:22-slim

# Step 2: Git install karein (Kyunki project clone karna hai)
RUN apt-get update && apt-get install -y git

# Step 3: Working directory set karein container ke andar
WORKDIR /app

# Step 4: Sirf package files pehle copy karein (Optimized caching ke liye)
COPY package*.json ./

# Step 5: Dependencies install karein
RUN npm install

# Step 6: Baaki ka saara source code copy karein
COPY . .

# Step 7: Build-server ko start karne ki command
# Ensure kijiye ki aapka entry point 'src/main.js' hi hai
CMD ["node", "src/main.js"]