const width=2000;
const height=330;
const margin={top:50,right:100,bottom:20,left:150};
d3.json("minecraft_danger_landscape.json").then(data=>{
    console.log("data loaded:",data);
    drawdimension(data.Overworld,"#viz-overworld",{
        terraincolor:"#5ba348",
        terrainbase:"#3f2614",
        groundlevel:height-20
    },5000);
    drawdimension(data.Nether,"#viz-nether",{
        terraincolor:"#8f2a2a",
        terrainbase:"#420e0e",
        groundlevel:height-20
    });
    drawdimension(data.End,"#viz-end",{
        terraincolor:"#dbbbff",
        terrainbase:"#120818",
        groundlevel:height-20
    });
}).catch(error => {
    console.error("error:", error);
});
function drawdimension(mobs,containerid,styles,customwidth=width) {
    if (!mobs || mobs.length===0) return;
    const svg=d3.select(containerid)
        .append("svg")
        .attr("width",customwidth)
        .attr("height",height)
        .style("overflow","visible");
    const xscale=d3.scaleLinear()
        .domain([0,mobs.length-1])
        .range([margin.left,customwidth-margin.right]);
    const yscale=d3.scalePow()
        .exponent(0.8)
        .domain([0, 100])
        .range([styles.groundlevel,margin.top]);
    const terraindata=mobs.map((d,i)=>({x:xscale(i),y:yscale(d.danger_score)}));
    const detailedterrain=[];

    for (let i=0;i<terraindata.length-1;i++) {
        const curr=terraindata[i];
        const next=terraindata[i+1];
        detailedterrain.push(curr);
        detailedterrain.push({x:curr.x+(next.x-curr.x)*0.33,y:curr.y+(Math.random()*20-10)});
        detailedterrain.push({x:curr.x+(next.x-curr.x)*0.66,y:next.y+(Math.random()*20-10)});
    }
    detailedterrain.push(terraindata[terraindata.length-1]);
    const area=d3.area()
        .x(d=>d.x).y0(height).y1(d=>d.y).curve(d3.curveLinear);
    svg.append("path")
        .datum(detailedterrain)
        .attr("fill",styles.terraincolor)
        .attr("stroke",styles.terrainbase)
        .attr("stroke-width",2)
        .attr("d",area);
    const mobgroup = svg.selectAll(".mob")
        .data(mobs)
        .enter()
        .append("g")
        .attr("class","mob")
        .attr("transform",(d,i)=>`translate(${xscale(i)},${yscale(d.danger_score)})`);
    mobgroup.append("ellipse")
        .attr("cx",0).attr("cy",0).attr("rx",20).attr("ry",5)
        .attr("fill", "rgba(0,0,0,0.5)");
    mobgroup.append("image")
        .attr("xlink:href",d=>d.image)
        .attr("x",-24).attr("y",-48)
        .attr("width",48).attr("height",48)
        .attr("class","mob-sprite")
        .style("cursor","pointer")
        .on("mouseover",function(event,d) {
            d3.select(this).transition().duration(100).attr("width",72).attr("height",72).attr("x",-36).attr("y",-72);
            const tooltip=d3.select("#tooltip");
            const tnode=tooltip.node();
            tooltip.style("opacity",1).html(`
                <h3>${d.name.replace(/_/g," ")}</h3>
                <div style="color: #ffaaaa;font-weight:bold;">Danger Score:${d.danger_score}</div>
                <div>Health:${d.stats.health} &hearts;</div>
                <div>Damage:${d.stats.damage} &#9876;</div>
                <div style="font-size: 0.8em; color: #aaa; margin-top:5px;">${d.behavior}</div>
            `);
            const twidth=tnode.offsetWidth;
            const theight=tnode.offsetHeight;

            let leftpos=event.pageX+15;
            if (event.clientX+twidth+20>window.innerWidth) {
                leftpos=event.pageX-twidth-20;
            }
            let toppos=event.pageY-28;
            if (event.clientY<theight+40) {
                toppos=event.pageY+40;
            }
            tooltip.style("left",leftpos+"px").style("top",toppos+"px");
        })
        .on("mouseout",function() {
            d3.select(this).transition().duration(100).attr("width",48).attr("height",48).attr("x",-24).attr("y",-48);
            d3.select("#tooltip").style("opacity",0);
        });
    const flyers=['ghast','phantom','allay','bat','wither','ender_dragon','bee','vex'];
    mobgroup.filter(d=>flyers.includes(d.name))
        .append("line")
        .attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",50)
        .attr("stroke","rgba(255,255,255,0.3)").attr("stroke-dasharray","4");
}