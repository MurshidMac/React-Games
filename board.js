// here comes the func Part of react Componenets 
// This the presentation Logic for My App
var Board= function (size){
    this.current_color=Board.BLACK;
    this.size=size;
    this.board=this.create_board(size);
    this.last_move_passed=false;
    this.in_atari=false;
    this.attempted_suicide=false;
};

Board.EMPTY=0;
Board.BLACK=1;
Board.WHITE=2;

// this is Object of the Board
// We are trying to create a matrix of size*size
Board.prototype.create_board=function (size){
    var m=[];                       // matrix
    for(var i=0; i<size; i++){
        m[i]=[];                    // this become an array
        for(var j=0; j<size;j++){
            m[i][j]=Board.EMPTY;    // we initially populate the Array empty
        }
    }
    return m;
};

// we need to switch the current player
// we switch the player by colour setting
Board.prototype.switch_player= function (){
    this.current_color= this.current_color==Board.BLACK ? Board.WHITE : Board.BLACK;
};
// At any point player can let his opponent pass him and play

Board.prototype.pass= function (){
    if (this.last_move_passed)
        this.end_game();            // ends the game if last pass
    this.last_move_passed=true;     // Move the Last Player
    this.switch_player();           //switch the player
}

// called when the game ends
Board.prototype.end_game=function(){
    console.log("Game Over");
}

// this how the play happens in the game
// player passes two points in the game
Board.prototype.play= function (i, j){
    console.log("played at "+i +", "+j);
    this.attempted_suicide=this.in_atari=false;

    if(this.board[i][j]!=Board.EMPTY){
        return false;
    }

    var colour =this.board[i][j]=this.current_color;    // setting the colour
    var captured=[];                                     // we are capturing the as an array
    var neighbors= this.adjacent_intersections(i,j);     // this is the adjacent Intersection
    var atari= false;

    var self= this;
    _.each(neighbors, function(n){
        var state= self.board[n[0]][n[1]];              // we stating the board
        if(state !=Board.EMPTY && state !=colour){      // Board is not empty and c
            var group= self.get_group(n[0],n[1]);
            console.log(group);
            if (group["liberties"]==0){
                captured.push(group);
            }
            else if(group["liberties"]==1){
                atari=true;
            }
        } 
    });

    //detecting the suicided
    if (_.isEmpty(captured) && this.get_group(i, j)["liberties"]==0){
        this.board[i][j]=Board.EMPTY;
        this.attempted_suicide=true;
        return false;
    }

    var self =this;
    _.each(captured, function (group){
        _.each(group["stones"], function (stone){
            self.board[stone[0]][stone[1]]=Board.EMPTY;
        });
    });

    if(atari){
        this.in_atari=true;
    }
    this.last_move_passed=false;
    this.switch_player();
    return true;
}

/*
*
*Given a board position; returns a list of [i, j] coordinates representing 
*Orthogonally adjacent Intersections
*/
Board.prototype.get_adjacent_intersections= function (i, j){
    var neighbors=[];
    if (i>0){
        neighbors.push([i-1, j]);
    }
    if(j<this.size-1){
        neighbors.push([i, j+1])
    }
    if(i<this.size -1){
        neighbors.push([i+1,j])
    }
    if(j>0){
        neighbors.push([i, j-1])
    }
    return neighbors;
}

//
//Here comes the crazy BFS search to find the   orthogonally adjacent position
//
//
//
Board.prototype.get_group=function(i,j){
    var color= this.board[i][j];
    if (color==Board.EMPTY)
        return null;
    
    var visited= {};   // js object
    var visited_list=[];
    var queue= [[i, j]];
    var count=0;

    while(queue.length>0){
        var stone=queue.pop();
        if (visited[stone]){
            continue;
        }

        var neighbors= this.get_adjacent_intersections(stone[0],stone[1]);
        var self=this;
        _.each(neighbors, function (n){
            var state = self.board[n[0]][n[1]];
            if (state == Board.EMPTY){
                count++;
            }
            if (state==color){
                queue.push([n[0],n[1]])
            }
        });

        visited[stone]=true;
        visited_list.push(stone);
    }

    return {
        "liberties":count,
        "stones": visited_list
    };
}





