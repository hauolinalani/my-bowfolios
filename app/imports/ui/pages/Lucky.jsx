import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Container, Row } from 'react-bootstrap';
import { useTracker } from 'meteor/react-meteor-data';
import { _ } from 'meteor/underscore';
import { Profiles } from '../../api/profiles/Profiles';
import { ProfilesInterests } from '../../api/profiles/ProfilesInterests';
import { ProfilesProjects } from '../../api/profiles/ProfilesProjects';
import { Projects } from '../../api/projects/Projects';
import LoadingSpinner from '../components/LoadingSpinner';
import { pageStyle } from './pageStyles';
import { PageIDs } from '../utilities/ids';
import ProfileCard from '../components/ProfileCard'; // Import ProfileCard component

/* Returns the Profile and associated Projects and Interests associated with the passed user email. */
function getProfileData(email) {
  const data = Profiles.collection.findOne({ email });
  const interests = _.pluck(ProfilesInterests.collection.find({ profile: email }).fetch(), 'interest');
  const projects = _.pluck(ProfilesProjects.collection.find({ profile: email }).fetch(), 'project');
  const projectPictures = projects.map(project => Projects.collection.findOne({ name: project })?.picture);
  return _.extend({}, data, { interests, projects: projectPictures });
}

/* Renders the Profile Collection as a set of Cards. */
const LuckyPage = () => {

  const { ready } = useTracker(() => {
    // Ensure that minimongo is populated with all collections prior to running render().
    const sub1 = Meteor.subscribe(Profiles.userPublicationName);
    const sub2 = Meteor.subscribe(ProfilesInterests.userPublicationName);
    const sub3 = Meteor.subscribe(ProfilesProjects.userPublicationName);
    const sub4 = Meteor.subscribe(Projects.userPublicationName);
    return {
      ready: sub1.ready() && sub2.ready() && sub3.ready() && sub4.ready(),
    };
  }, []);

  const emails = _.pluck(Profiles.collection.find().fetch(), 'email');
  const profileData = emails.map(email => getProfileData(email));
  const profile = _.sample(profileData);

  return ready ? (
    <Container id={PageIDs.profilesPage} style={pageStyle}>
      <Row xs={1} md={2} lg={4} className="g-2">
        {/* Render ProfileCard component with profile prop */}
        <ProfileCard profile={profile} />
      </Row>
    </Container>
  ) : <LoadingSpinner />;
};

export default LuckyPage;
