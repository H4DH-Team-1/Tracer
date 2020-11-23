/* src/App.js */
import React, { useState } from 'react'

const initialState = { name: '', phone: '', postcode: '', maskId: '' }

const App = (props) => {
  const [formState, setFormState] = useState(initialState)

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  function callSaveAddCheckin()
  {
    props.saveAddCheckin(formState)
    setFormState(initialState)
  }

  return (
    <div>
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
      <br />
      <button style={styles.buttonSave} onClick={callSaveAddCheckin} disabled={!formState.name || !formState.phone || !formState.postcode || !formState.maskId}>Create Checkin</button>
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  checkin: {  marginBottom: 15, border: '2px solid black', padding: '5px' },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  checkinName: { fontSize: 20, fontWeight: 'bold' },
  checkinDescription: { marginBottom: 0, fontFamily: 'monospace' },
  buttonAddEdit: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '5px' },
  buttonSave: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '5px' }
}

export default App