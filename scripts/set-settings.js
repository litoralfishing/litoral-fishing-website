#!/usr/bin/env node
const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI not set. Make sure .env.local exists and has MONGODB_URI defined.')
  process.exit(1)
}

const input = process.argv[2]
let data
if (input) {
  try {
    data = JSON.parse(input)
  } catch (err) {
    console.error('Invalid JSON argument:', err.message)
    process.exit(1)
  }
} else {
  data = {
    instagramUrl: 'https://www.instagram.com/litoralfishing.sf/',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61587423848412',
    whatsappUrl: 'https://wa.link/k8qnyc',
    whatsappNumber: '3404519318',
    address: 'Av Gorriti 4610, Santa Fe, Santa Fe 3000',
    location: '',
    phone: ''
  }
}

async function main() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db('litoral-fishing')
    const res = await db.collection('settings').updateOne(
      { type: 'site' },
      { $set: { ...data, type: 'site', updatedAt: new Date().toISOString() } },
      { upsert: true }
    )

    if (res.upsertedId) {
      console.log('Inserted settings with id:', res.upsertedId._id || res.upsertedId)
    } else {
      console.log('Updated existing settings document')
    }
  } catch (err) {
    console.error('Error updating settings:', err)
    process.exit(1)
  } finally {
    await client.close()
  }
}

main()
