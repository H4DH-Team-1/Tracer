/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { listCheckins } from './graphql/queries'
import AddCheckin from './AddCheckin'
import EditCheckin from './EditCheckin'
import { createCheckin, deleteCheckin, updateCheckin } from './graphql/mutations'
import { onCreateCheckin, onUpdateCheckin, onDeleteCheckin } from './graphql/subscriptions'
//import { updateCheckinBasicDetails } from './graphql/customMutations'

import awsExports from './aws-exports';
Amplify.configure(awsExports);

const initialState = { id: null, name: '', phone: '', postcode: '', maskId: '' }

const App = () => {
  const [editing, setEditing] = useState(false)
  const [currentCheckin, setCurrentCheckin] = useState(initialState)
  const [checkins, setCheckins] = useState([])

  useEffect(() => {
    fetchCheckins()
  }, [])

  useEffect(() => {     
   let createSubscription     
   async function setupCreateSubscription() {            
    createSubscription = API.graphql(graphqlOperation(onCreateCheckin)).subscribe({  
          next: (data) => {    
              const checkin = data.value.data.onCreateCheckin          
              setCheckins(e => e.concat([checkin].sort(makeComparator('name'))))
            }    
        })   
      }   
      setupCreateSubscription()
    return () => createSubscription.unsubscribe();
  }, [])

  useEffect(() => {     
    let editSubscription     
    async function setupEditSubscription() {            
      editSubscription = API.graphql(graphqlOperation(onUpdateCheckin)).subscribe({  
           next: (data) => {
              const checkin = data.value.data.onUpdateCheckin          
              setCheckins(e => e.map(item => (item.id === checkin.id ? checkin : item)))
             }    
         })   
       }   
       setupEditSubscription()
     return () => editSubscription.unsubscribe();
   }, [])

  useEffect(() => {     
    let deleteSubscription     
    async function setupDeleteSubscription() {            
      deleteSubscription = API.graphql(graphqlOperation(onDeleteCheckin)).subscribe({  
            next: (data) => {
              const checkin = data.value.data.onDeleteCheckin          
              setCheckins(e => e.filter(item => item.id !== checkin.id))
            }    
          })   
        }   
        setupDeleteSubscription()
      return () => deleteSubscription.unsubscribe();
  }, [])

  function makeComparator(key, order = 'asc') {
    return (a, b) => {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) 
        return 0;
      
      const aVal = (typeof a[key] === 'string')
        ? a[key].toUpperCase()
        : a[key];
      const bVal = (typeof b[key] === 'string')
        ? b[key].toUpperCase()
        : b[key];

      let comparison = 0;
      if (aVal > bVal) 
        comparison = 1;
      if (aVal < bVal) 
        comparison = -1;
      
      return order === 'desc'
        ? (comparison * -1)
        : comparison
    };
  }

  async function fetchCheckins() {
    try {
      const checkinData = await API.graphql(graphqlOperation(listCheckins))
      const retrievedCheckins = checkinData.data.listCheckins.items
      //setCheckins(a => a.concat([retrievedCheckins].sort(makeComparator('name'))))
      setCheckins(retrievedCheckins)
    } catch (err) { console.log('error fetching checkins') }
  }

  async function saveAddCheckin(data) {
    try {
      if (!data.name || !data.phone || !data.postcode || !data.maskId)
      {
        console.log('INVALID ADD: ' + JSON.stringify(data))
        return
      }
      data.id = null //ensure this is null when creating
      const checkin = { ...data }
      //setCheckins([...checkins, data]) //this was here to do 'pending' but it's so fast it's not needed
      await API.graphql(graphqlOperation(createCheckin, {input: data}))
    } catch (err) {
      console.log('error creating checkin:', err)
    }
  }

  async function prepareEditCheckin(checkin) {
    setEditing(true)
    setCurrentCheckin({ id: checkin.id, name: checkin.name, phone: checkin.phone, postcode: checkin.postcode, maskId: checkin.maskId })
  }

  async function saveEditCheckin(data) {
    try {
      if (!data.id || !data.name || !data.phone || !data.postcode || !data.maskId)
      {
        console.log('INVALID EDIT: ' + JSON.stringify(data))
        return
      }
      const checkin = { ...data }
      //setCheckins(checkins.map(item => (item.id === data.id ? data : item)))
      await API.graphql(graphqlOperation(updateCheckin, {input: data}))
      setEditing(false)
    } catch (err) {
      console.log('error saving checkin:', err)
    }
  }

  async function saveDeleteCheckin(data) {
    try {
      if (!data.id)
      {
        console.log('INVALID DELETE: ' + JSON.stringify(data))
        return
      }
      const checkin = { id: data.id }
      //setCheckins(checkins.filter(item => item.id !== data.id))
      await API.graphql(graphqlOperation(deleteCheckin, {input: checkin}))
      setEditing(false)
    } catch (err) {
      console.log('error saving checkin:', err)
    }
  }

  return (
    <div style={styles.container}>
      <h1>Mask Tracer<br />Security Console</h1>
      <h2>Active Checkins:</h2>
      {
        checkins.sort(makeComparator('name')).map((checkin, index) => (
          <div key={checkin.id ? checkin.id : index} style={styles.checkin}>
            <p style={styles.checkinName}>{checkin.name}</p>
            <p style={styles.checkinDescription}>Phone:     {checkin.phone}</p>
            <p style={styles.checkinDescription}>Postcode:  {checkin.postcode}</p>
            <p style={styles.checkinDescription}>Mask ID:   {checkin.maskId}</p>
            <p style={styles.checkinDescription}>Has Photo? {checkin.photo ? 'Yes' : 'No'}</p>
        { checkin.id ? null : <p style={styles.checkinDescriptionAlert}>PENDING SAVE!!!</p> }
            <button style={styles.buttonAddEdit} onClick={() => prepareEditCheckin(checkin)}>Edit Checkin</button>
          </div>
        ))
      }
      <hr />
      {editing ? 
      (
        <>
          <h2>Edit Checkin:</h2>
          <tt>({currentCheckin.id})</tt>
          <EditCheckin
            editing={editing}
            setEditing={setEditing}
            formState={currentCheckin}
            saveEditCheckin={saveEditCheckin}
            saveDeleteCheckin={saveDeleteCheckin}
          />
        </>
      ) : (
        <>
          <h2>Create Checkin:</h2>
          <AddCheckin saveAddCheckin={saveAddCheckin} />
        </>
      )}
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  checkin: {  marginBottom: 15, border: '2px solid black', padding: '5px' },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  checkinName: { fontSize: 20, fontWeight: 'bold' },
  checkinDescription: { marginBottom: 0, fontFamily: 'monospace' },
  checkinDescriptionAlert: { marginBottom: 0, fontFamily: 'monospace', color: 'red' },
  buttonAddEdit: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '5px' },
  buttonSave: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '5px' }
}

export default App