[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/6BOvYMwN)


# Setting up our environment locally

<strong>Note: Ensure you have [npm installed with node version v18.18.2](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or higher and install [Docker Compose](https://docs.docker.com/compose/).</strong>

### Local Deployment Architecture
![cs3219_overall_architecture-local deployment drawio](https://github.com/CS3219-AY2324S1/ay2324s1-course-assessment-g05/assets/70256674/1effd102-dec3-4ba1-8b4f-04bba5f1e178)


### Instructions on setting up local deployment

1. Download the environment variables from the folder on Canvas. 

2. Create a new .env file in the root directory `/` and paste all the contents into this file. (Location of .env file is illustrated below)

![image](https://github.com/CS3219-AY2324S1/ay2324s1-course-assessment-g05/assets/70256674/ee7ad5b8-d861-40ff-9e34-7e012442bb24)

3. Copy and paste the same .env file into the frontend directory `/frontend/`:

![image](https://github.com/CS3219-AY2324S1/ay2324s1-course-assessment-g05/assets/70256674/164f0701-3a33-4576-abd3-7cf7cab5bcca)

4. In this `/frontend/` directory, run `npm install`, followed by `npm run build && node .next/standalone/server.js`. This should download all the required packages and start up the frontend.

5. In the root directory `/`, run `docker compose -p peerprep up` to launch the backend services. 

6. Wait for both frontend and backend to stabilize before moving forwards with the application.

Frontend:

![image](https://github.com/CS3219-AY2324S1/ay2324s1-course-assessment-g05/assets/70256674/d976ecdf-c016-4010-b00d-c02d1896c501)

Backend: (Fully deployed state of running 8/8 containers)

![image](https://github.com/CS3219-AY2324S1/ay2324s1-course-assessment-g05/assets/70256674/81080754-7524-4fed-a894-ff832bbb0e3d)
