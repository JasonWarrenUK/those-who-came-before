<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    console.log('Mounted');
  });
</script>

<main>
  <section id="tasks" class="py-4">
    <div id="tasks-header" class="container prose">
      <h2>
        Tasks
      </h2>
    </div>

    <div id="tasks-list" class="container flex flex-row justify-around py-4">
      <div class="card card-border bg-base-300">
        <div class="card-body prose">
          <h2 class="card-title">
            Task
            <div class="badge badge-secondary">
              To Do
            </div>
          </h2>
          
          <p>
            Task description goes here
          </p>
        </div>
      </div>

      <div class="card card-border bg-base-300">
        <div class="card-body prose">
          <h2 class="card-title">
            Task
            <div class="badge badge-secondary">
              To Do
            </div>
          </h2>
          
          <p>
            Task description goes here
          </p>
        </div>
      </div>
      
      <div class="card card-border bg-base-300">
        <div class="card-body prose">
          <h2 class="card-title">
            Task
            <div class="badge badge-secondary">
              To Do
            </div>
          </h2>
          
          <p>
            Task description goes here
          </p>
        </div>
      </div>
    </div>
  </section>

  <section id="timeline" class="container py-4">
    <div id="timeline-header" class="container prose">
      <h2>
        Timeline
      </h2>
    </div>

    <div id="timeline-list" class="container">
      <ul class="timeline timeline-vertical">
        <li>
          <div class="timeline-start timeline-box">Event Name</div>
          <div class="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="text-primary h-5 w-5"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <hr class="bg-primary" />
        </li>

        <li>
          <hr class="bg-primary" />
          <div class="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="text-primary h-5 w-5"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="timeline-end timeline-box">Event Name</div>
          <hr class="bg-primary" />
        </li>

        <li>
          <hr class="bg-primary" />
          <div class="timeline-start timeline-box">Event Name</div>
          <div class="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="text-primary h-5 w-5"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <hr />
        </li>

        <li>
          <hr />
          <div class="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-5 w-5"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="timeline-end timeline-box">Event Name</div>
          <hr />
        </li>
        
        <li>
          <hr />
          <div class="timeline-start timeline-box">Event Name</div>
          <div class="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-5 w-5"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </li>
      </ul>
    </div>
  </section>
</main>
