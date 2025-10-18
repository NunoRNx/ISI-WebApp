CREATE TABLE movies (
    id INT NOT NULL,
    title TEXT NOT NULL,
    year INT NULL,
    language VARCHAR(8) NULL,
    movie_length VARCHAR(8) NULL,
    CONSTRAINT PK_movies PRIMARY KEY (id)
);

CREATE TABLE subtitles (
    id INT IDENTITY(1,1) NOT NULL,
    movie_id INT NOT NULL,
    start_time VARCHAR(8) NOT NULL,
    end_time VARCHAR(8) NOT NULL,
    text TEXT NOT NULL,
    CONSTRAINT PK_subtitles PRIMARY KEY (id),
    CONSTRAINT uq_subtitle UNIQUE (movie_id, start_time, end_time),
    CONSTRAINT fk_movie FOREIGN KEY (movie_id) 
        REFERENCES movies(id)
        ON DELETE CASCADE
);
