   <div class="filter-button-container">
          <ps-chip
            [isSelected]="!!selectedFiltersCount"
            (click)="toggleModal(true)">
            <svg
              slot="icon"
              aria-hidden="true"
              focusable="false"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none">
              <path
                d="M14.5064 2.10671C14.3864 1.87337 14.1664 1.76671 13.9131 1.76004H2.08642C1.83308 1.78004 1.62642 1.88004 1.49308 2.10671C1.35975 2.33337 1.39308 2.58004 1.52642 2.78671L5.99308 7.86671V13.6334C5.99308 14.0867 6.47308 14.3734 6.87308 14.1734L9.39308 12.8867C9.77975 12.6867 10.0331 12.2867 10.0331 11.84V7.86004L14.4731 2.80004C14.5931 2.58671 14.6197 2.34671 14.5064 2.12004V2.10671ZM9.37308 12.1734L6.66642 13.5134L6.65308 7.62004L2.07308 2.42671H13.9131L9.38642 7.58004L9.37308 12.1867V12.1734Z"
                fill="#262626" />
            </svg>
            Filter ({{ selectedFiltersCount }})
          </ps-chip>
        </div>
