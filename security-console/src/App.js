/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createCheckin } from './graphql/mutations'
import { listCheckins } from './graphql/queries'
import Camera from './Camera'

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', phone: '', postcode: '', maskId: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [checkins, setCheckins] = useState([])

  useEffect(() => {
    fetchCheckins()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchCheckins() {
    try {
      const checkinData = await API.graphql(graphqlOperation(listCheckins))
      const retrievedCheckins = checkinData.data.listCheckins.items
      setCheckins(retrievedCheckins)
    } catch (err) { console.log('error fetching checkins') }
  }

  async function addCheckin() {
    try {
      if (!formState.name || !formState.phone || !formState.postcode || !formState.maskId) return
      const checkin = { ...formState }
      setCheckins([...checkins, checkin])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createCheckin, {input: checkin}))
    } catch (err) {
      console.log('error creating checkin:', err)
    }
  }

  return (
    <div style={styles.container}>
      <h2>Active Checkins:</h2>
      {
        checkins.map((checkin, index) => (
          <div key={checkin.id ? checkin.id : index} style={styles.checkin}>
            <p style={styles.checkinName}>{checkin.name}</p>
            <p style={styles.checkinDescription}>{checkin.phone}</p>
            <p style={styles.checkinDescription}>{checkin.postcode}</p>
            <p style={styles.checkinDescription}>{checkin.maskId}</p>
          </div>
        ))
      }
      <hr />
      <h2>Create Checkin:</h2>
      <h4>Checkins should happen from people's phones, but if a kiosk is required we could use this form:</h4>
      <input
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={event => setInput('phone', event.target.value)}
        style={styles.input}
        value={formState.phone}
        placeholder="Phone"
      />
      <input
        onChange={event => setInput('postcode', event.target.value)}
        style={styles.input}
        value={formState.postcode}
        placeholder="Postcode"
      />
      <input
        onChange={event => setInput('maskId', event.target.value)}
        style={styles.input}
        value={formState.maskId}
        placeholder="Mask ID"
      />
      <Camera maskId={formState.maskId}></Camera>
      <br />
      <button style={styles.button} onClick={addCheckin}>Create Checkin</button>
      
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  checkin: {  marginBottom: 15, border: '2px solid black' },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  checkinName: { fontSize: 20, fontWeight: 'bold' },
  checkinDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default App