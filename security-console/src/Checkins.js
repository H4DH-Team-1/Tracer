/* src/App.js */
import React, { useEffect, useState } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import Storage from '@aws-amplify/storage';
import { listCheckins, getCheckin } from './graphql/queries';
import AddCheckin from './AddCheckin';
import EditCheckin from './EditCheckin';
import {
  createCheckin,
  deleteCheckin,
  updateCheckin,
} from './graphql/mutations';
import {
  onCreateCheckin,
  onUpdateCheckin,
  onDeleteCheckin,
} from './graphql/subscriptions';
import Camera from './Camera';
import awsExports from './aws-exports';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Backdrop from '@material-ui/core/Backdrop';
import Modal from '@material-ui/core/Modal';
import Fade from '@material-ui/core/Fade';
import Divider from '@material-ui/core/Divider';
import Switch from '@material-ui/core/Switch';
import EditIcon from '@material-ui/icons/Edit';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';

const useStyles = makeStyles((theme) => ({
  card: {
    width: '100%',
    minWidth: 275,
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const initialState = {
  id: null,
  name: '',
  phone: '',
  postcode: '',
  maskId: '',
};

const Checkins = () => {
  const [editing, setEditing] = useState(false);
  const [editModeData, setEditModeData] = useState(true);
  const [currentCheckin, setCurrentCheckin] = useState(initialState);
  const [checkins, setCheckins] = useState([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [forceRefresh, setForceRefresh] = useState(false); //this ended up not being required :)
  const [open, setOpen] = React.useState(false);
  const [kiosk, setKiosk] = React.useState(false);

  const classes = useStyles();

  useEffect(() => {
    fetchCheckins();
  }, [forceRefresh]);

  useEffect(() => {
    let createSubscription;
    async function setupCreateSubscription() {
      createSubscription = API.graphql(
        graphqlOperation(onCreateCheckin)
      ).subscribe({
        next: (data) => {
          const checkin = data.value.data.onCreateCheckin;
          if (!checkin) {
            //We sometimes get errors from mutations, still trying to figure it out
            //In the meantime just force a refresh to the app appears to work!
            //Ahh love hackathons!  Do not do this in prod, fix the underlying issue!!!
            console.log('CREATE SUB ERROR: ' + JSON.stringify(data));
            setForceRefresh(!forceRefresh);

            //LEARNING: Fixed Dis!!  Return items on update.. see app.js in function
          } else {
            setCheckins((e) => e.concat([checkin]));
          }
        },
      });
    }
    setupCreateSubscription();
    return () => createSubscription.unsubscribe();
  }, []);

  useEffect(() => {
    let editSubscription;
    async function setupEditSubscription() {
      editSubscription = API.graphql(
        graphqlOperation(onUpdateCheckin)
      ).subscribe({
        next: (data) => {
          const checkin = data.value.data.onUpdateCheckin;
          setCheckins((e) =>
            e.map((item) => (item.id === checkin.id ? checkin : item))
          );
        },
      });
    }
    setupEditSubscription();
    return () => editSubscription.unsubscribe();
  }, []);

  useEffect(() => {
    let deleteSubscription;
    async function setupDeleteSubscription() {
      deleteSubscription = API.graphql(
        graphqlOperation(onDeleteCheckin)
      ).subscribe({
        next: (data) => {
          const checkin = data.value.data.onDeleteCheckin;
          setCheckins((e) => e.filter((item) => item.id !== checkin.id));
        },
      });
    }
    setupDeleteSubscription();
    return () => deleteSubscription.unsubscribe();
  }, []);

  function makeComparator(key, order = 'asc') {
    return (a, b) => {
      if (!a || !b || !a.hasOwnProperty(key) || !b.hasOwnProperty(key))
        return 0

      const aVal = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key]
      const bVal = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key]

      let comparison = 0
      if (aVal > bVal) comparison = 1
      if (aVal < bVal) comparison = -1

      return order === 'desc' ? comparison * -1 : comparison
    }
  }

  async function fetchCheckins() {
    try {
      const checkinData = await API.graphql(graphqlOperation(listCheckins));
      const retrievedCheckins = checkinData.data.listCheckins.items;
      setCheckins(retrievedCheckins);
    } catch (err) {
      console.log('error fetching checkins');
    }
  }

  async function saveAddCheckin(data) {
    try {
      if (!data.name || !data.phone || !data.postcode || !data.maskId) {
        console.log('INVALID ADD: ' + JSON.stringify(data));
        return;
      }
      data.id = data.maskId;
      const checkin = { ...data };
      await API.graphql(graphqlOperation(createCheckin, { input: checkin }));
    } catch (err) {
      console.log('error creating checkin:', err);
    }
  }

  async function prepareEditCheckin(checkin, isDataEdit) {
    setEditing(true)
    setEditModeData(isDataEdit)
    const fullCheckin = checkin; //(await API.graphql(graphqlOperation(getCheckin, {id: checkin.id}))).data.getCheckin
    setCurrentCheckin({
      id: fullCheckin.id,
      name: fullCheckin.name,
      phone: fullCheckin.phone,
      postcode: fullCheckin.postcode,
      maskId: fullCheckin.maskId,
    })
    if (fullCheckin.photo && fullCheckin.photo.key) {
      try {
        const imageUrl = await Storage.get(fullCheckin.photo.key)
        if (imageUrl) {
          setCurrentImageUrl(imageUrl)
        } else {
          setCurrentImageUrl('')
        }
      } catch (err) {
        console.log('error retrieving image:', err)
      }
    }
    setOpen(true);
  }

  async function saveEditCheckin(data) {
    try {
      if (
        !data.id ||
        !data.name ||
        !data.phone ||
        !data.postcode ||
        !data.maskId
      ) {
        console.log('INVALID EDIT: ' + JSON.stringify(data));
        return;
      }
      const checkin = { ...data };
      await API.graphql(graphqlOperation(updateCheckin, { input: checkin }));
      setEditing(false);
      setCurrentImageUrl('');
    } catch (err) {
      console.log('error saving checkin:', err);
    }
  }

  async function saveDeleteCheckin(data) {
    try {
      if (!data.id) {
        console.log('INVALID DELETE: ' + JSON.stringify(data));
        return;
      }
      const checkin = { id: data.id };
      await API.graphql(graphqlOperation(deleteCheckin, { input: checkin }));
      //todo - figure out if we need to delete movements
      setEditing(false);
      setCurrentImageUrl('');
    } catch (err) {
      console.log('error saving checkin:', err);
    }
  }

  async function saveEditCheckinPhoto(data, image) {
    try {
      if (
        !data.id ||
        !data.name ||
        !data.phone ||
        !data.postcode ||
        !data.maskId
      ) {
        console.log('INVALID EDIT PHOTO: ' + JSON.stringify(data));
        return;
      }
      if (!image) {
        console.log('INVALID EDIT PHOTO: NO IMAGE FOUND!');
        return;
      }
      const fileName = 'c-' + data.maskId + '.jpg';
      const base64Data = new Buffer.from(
        image.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );
      await Storage.put(fileName, base64Data, {
        contentType: 'image/jpeg',
        contentEncoding: 'base64',
      });

      const checkin = { ...data };
      checkin.photo = {
        bucket: awsExports.aws_user_files_s3_bucket,
        region: awsExports.aws_user_files_s3_bucket_region,
        key: fileName,
      };
      await API.graphql(graphqlOperation(updateCheckin, { input: checkin }));
      setEditing(false);
      setCurrentImageUrl('');
    } catch (err) {
      console.log('error saving checkin:', err);
    }
  }

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={kiosk ? 6 : 10}>
        <Typography variant='h4' component='h1'>
          Active Check-ins
        </Typography>
        <List>
          {checkins.sort(makeComparator('name')).map((checkin, index) => (
            <ListItem
              alignItems='flex-start'
              key={checkin.id ? checkin.id : index}>
              <Card className={classes.card}>
                <CardContent>
                  <Typography variant='h5' component='h2'>
                    {checkin.name}
                  </Typography>
                  <Typography variant='body2' component='p'>
                    <pre>
                      Phone: {checkin.phone}
                      <br />
                      Postcode: {checkin.postcode}
                      <br />
                      Has Photo? {checkin.photo ? 'Yes' : 'No'}
                      <br />
                      Face Id? {checkin.identifiedPersonId ? 'Yes' : 'No'}
                      <br />
                    </pre>
                  </Typography>
                  <Typography
                    className={classes.title}
                    color='textSecondary'
                    gutterBottom>
                    {checkin.id}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size='small'
                    variant='outlined'
                    onClick={() => prepareEditCheckin(checkin, true)}>
                    <EditIcon /> Edit
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    onClick={() => prepareEditCheckin(checkin, false)}>
                    <AddAPhotoIcon /> Change Photo
                  </Button>
                </CardActions>
              </Card>
            </ListItem>
          ))}
        </List>
      </Grid>

      {editing ? (
        <Modal
          aria-labelledby='transition-modal-title'
          aria-describedby='transition-modal-description'
          className={classes.modal}
          open={open}
          onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}>
          <Fade in={open}>
            <div className={classes.paper}>
              <Typography variant='h4' component='h2'>
                Edit Check-in:
              </Typography>
              <Typography variant='caption' display='block' gutterBottom>
                ({currentCheckin.id})
              </Typography>
              {currentImageUrl ? <img src={currentImageUrl} /> : '(No image)'}
              { editModeData ? <EditCheckin
                editing={editing}
                setEditing={setEditing}
                formState={currentCheckin}
                saveEditCheckin={saveEditCheckin}
                saveDeleteCheckin={saveDeleteCheckin}
              /> : null }
              { !editModeData ? <Camera
                data={currentCheckin}
                callPhotoCapturedFunc={saveEditCheckinPhoto}></Camera> : null }
            </div>
          </Fade>
        </Modal>
      ) : null}
      <Grid item xs={kiosk ? 6 : 2}>
        <Typography variant='h4' component='h1'>
          Kiosk Check-in
        </Typography>
        <Switch value={kiosk} onChange={(e) => setKiosk(e.target.checked)} />
        {kiosk ? <AddCheckin saveAddCheckin={saveAddCheckin} /> : null}
      </Grid>
    </Grid>
  );
};

export default withAuthenticator(Checkins);
