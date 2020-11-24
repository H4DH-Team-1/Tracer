/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from '@aws-amplify/ui-react'
import Storage from '@aws-amplify/storage'
import { listCheckins, getCheckin } from './graphql/queries'
import AddCheckin from './AddCheckin'
import EditCheckin from './EditCheckin'
import { createCheckin, deleteCheckin, updateCheckin } from './graphql/mutations'
import { onCreateCheckin, onUpdateCheckin, onDeleteCheckin } from './graphql/subscriptions'
import Camera from './Camera'
import awsExports from './aws-exports'

const initialState = { id: null, name: '', phone: '', postcode: '', maskId: '' }

const App = () => {
  const [editing, setEditing] = useState(false)
  const [currentCheckin, setCurrentCheckin] = useState(initialState)
  const [checkins, setCheckins] = useState([])
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  const [forceRefresh, setForceRefresh] = useState(false) //this ended up not being required :)

  useEffect(() => {
    fetchCheckins()
  }, [forceRefresh])

  useEffect(() => {     
   let createSubscription     
   async function setupCreateSubscription() {            
    createSubscription = API.graphql(graphqlOperation(onCreateCheckin)).subscribe({  
          next: (data) => {    
              const checkin = data.value.data.onCreateCheckin
              if (!checkin)
              {
                //We sometimes get errors from mutations, still trying to figure it out
                //In the meantime just force a refresh to the app appears to work!
                //Ahh love hackathons!  Do not do this in prod, fix the underlying issue!!!
                console.log('CREATE SUB ERROR: ' + JSON.stringify(data))  
                setForceRefresh(!forceRefresh)

                //LEARNING: Fixed Dis!!  Return items on update.. see app.js in function
              }
              else
              {
                setCheckins(e => e.concat([checkin]))
              }
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
      if (!a || !b || !a.hasOwnProperty(key) || !b.hasOwnProperty(key)) 
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
      data.id = data.maskId
      const checkin = { ...data }
      await API.graphql(graphqlOperation(createCheckin, {input: checkin}))
    } catch (err) {
      console.log('error creating checkin:', err)
    }
  }

  async function prepareEditCheckin(checkin) {
    setEditing(true)
    const fullCheckin = checkin //(await API.graphql(graphqlOperation(getCheckin, {id: checkin.id}))).data.getCheckin
    setCurrentCheckin({ id: fullCheckin.id, name: fullCheckin.name, phone: fullCheckin.phone, postcode: fullCheckin.postcode, maskId: fullCheckin.maskId })
    if (fullCheckin.photo && fullCheckin.photo.key)
    {
      try {
        const imageUrl = await Storage.get(fullCheckin.photo.key)
        if (imageUrl)
        {
          setCurrentImageUrl(imageUrl)
        }
        else
        {
          setCurrentImageUrl('')
        }
      } catch (err) {
        console.log('error retrieving image:', err)
      }
    }
  }

  async function saveEditCheckin(data) {
    try {
      if (!data.id || !data.name || !data.phone || !data.postcode || !data.maskId)
      {
        console.log('INVALID EDIT: ' + JSON.stringify(data))
        return
      }
      const checkin = { ...data }
      await API.graphql(graphqlOperation(updateCheckin, {input: checkin}))
      setEditing(false)
      setCurrentImageUrl('')
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
      await API.graphql(graphqlOperation(deleteCheckin, {input: checkin}))
      setEditing(false)
      setCurrentImageUrl('')
    } catch (err) {
      console.log('error saving checkin:', err)
    }
  }

  async function saveEditCheckinPhoto(data, image) {
    try {
      if (!data.id || !data.name || !data.phone || !data.postcode || !data.maskId)
      {
        console.log('INVALID EDIT PHOTO: ' + JSON.stringify(data))
        return
      }
      if (!image)
      {
        console.log('INVALID EDIT PHOTO: NO IMAGE FOUND!')
        return
      }
      const fileName = 'c-' + data.maskId + '.jpg'
      const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64')
      await Storage.put(fileName, base64Data, {
        contentType: 'image/jpeg',
        contentEncoding: 'base64'
      })

      const checkin = { ...data }
      checkin.photo = {
        bucket: awsExports.aws_user_files_s3_bucket,
        region: awsExports.aws_user_files_s3_bucket_region,
        key: fileName
      }
      await API.graphql(graphqlOperation(updateCheckin, {input: checkin}))
      setEditing(false)
      setCurrentImageUrl('')
    } catch (err) {
      console.log('error saving checkin:', err)
    }
  }

  return (
    <div style={styles.container}>
      <h1>Mask Tracer<br />Security Console</h1>
      <h2>Active Checkins:</h2>
      {
        !checkins ? <p>None!</p> : checkins.sort(makeComparator('name')).map((checkin, index) => (
          <div key={checkin.id ? checkin.id : index} style={styles.checkin}>
            <p style={styles.checkinName}>{checkin.name ? checkin.name : '[Unknown Error!]'}</p>
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
          { currentImageUrl ? <img src={currentImageUrl} style={{ width: 400 }} /> : '(No image)' }
          <EditCheckin
            editing={editing}
            setEditing={setEditing}
            formState={currentCheckin}
            saveEditCheckin={saveEditCheckin}
            saveDeleteCheckin={saveDeleteCheckin}
          />
          <Camera data={currentCheckin} callPhotoCapturedFunc={saveEditCheckinPhoto}></Camera>
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

export default withAuthenticator(App)